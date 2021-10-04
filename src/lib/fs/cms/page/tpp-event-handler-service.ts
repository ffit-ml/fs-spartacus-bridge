import { PreviewTranslationKey } from './preview/preview-translation.service';
import { PreviewService } from './preview/preview.service';
import { FsCmsPageInterface } from './fs-cms-page.interface';
import { TppWrapperService } from './tpp-wrapper-service';
import { Injectable, NgZone } from '@angular/core';
import { CaasClientFactory } from '../../caas/caas-client.factory';
import { combineLatest, iif, throwError, of } from 'rxjs';
import { LanguageService, PageType } from '@spartacus/core';
import { take, switchMap, first } from 'rxjs/operators';
import { PreviewPageService } from './preview/preview-page.service';
import { findDocumentsInCaasResponse, reExecutable, bind } from '../../util/helper';

@Injectable({
  providedIn: 'root',
})
export class TppEventHandlerService {
  private isFirstOnRequestPreviewElementCall: boolean;

  constructor(
    private tppWrapperService: TppWrapperService,
    private previewPageService: PreviewPageService,
    private languageService: LanguageService,
    private caasClientFactory: CaasClientFactory,
    private ngZone: NgZone,
    private previewService: PreviewService
  ) {
    this.isFirstOnRequestPreviewElementCall = true;
  }

  initialize() {
    this.tppWrapperService.onRequestPreviewElement((previewId: string) => {
      // TPP_SNAP calls the onRequestPreviewElement() event handler regardless of whether it is the
      // initial page load, the creation of a page or the click on a report item.
      // Since we want to ignore this initial call, we need to store whether the handler has been
      // called once since the service was created
      if (this.isFirstOnRequestPreviewElementCall) {
        this.isFirstOnRequestPreviewElementCall = false;
        return;
      }
      this.ngZone.run(async () => {
        const currentPreviewId = await this.tppWrapperService.getPreviewElement();
        if (previewId != null && currentPreviewId !== previewId) {
          console.log(`Requesting to display the element with previewId '${previewId}'...`);
          const elementStatus = await this.tppWrapperService.getElementStatus(previewId);
          if (elementStatus?.uid != null) {
            console.log(
              `... element status: displayName '${elementStatus?.displayName || elementStatus?.name || '<not available>'}' and uid '${
                elementStatus?.uid
              }' `
            );
            let hybrisPageId = await this.tppWrapperService.getHybrisPageId(elementStatus.uid);
            console.log(`GetHybrisPageId script execution result = ${JSON.stringify(hybrisPageId)}`);
            if (hybrisPageId != null) {
              const showPageNotAvailableErrorMessage = () =>
                this.previewService.showDetailedErrorDialog(PreviewTranslationKey.REQUESTED_CAAS_PAGE_NOT_AVAILABLE_YET, {
                  pageUid: elementStatus.uid,
                });
              // The function tppWrapperService.getHybrisPageId() returns its passed argument (=page uid in this case)
              // if no hybrisPageId can be found in the form of the page. This is always the case when we create a new page
              // via the CC, because we don't call the function tppWrapperService.setHybrisPageId() in this case. If the
              // hybrisPageId equals the elementStatus.uid, then we assume that we just created a new page using the CC.
              // Since it takes a few seconds for this page to be available in the CaaS, we call this.fetchPageFromCaas() for this case.
              // This function tries to fetch the page in the CaaS several times. If it is found, it navigates to it.
              // Otherwise, an error message is displayed.
              if (hybrisPageId === elementStatus.uid) {
                const caasResult = (await this.fetchPageFromCaas(hybrisPageId)) as FsCmsPageInterface;
                if (caasResult?.uid == null) {
                  showPageNotAvailableErrorMessage();
                  return;
                } else {
                  hybrisPageId = `${PageType.CONTENT_PAGE}:${elementStatus.uid}`;
                  await this.tppWrapperService.setHybrisPageId(elementStatus.uid, hybrisPageId);

                  // We cannot await this, because showEditDialog doesn't return a promise.
                  this.tppWrapperService.showEditDialog(previewId);
                }
              }
              if ((await this.previewPageService.navigateTo(hybrisPageId)) !== true) {
                console.warn(`Could not navigate to the element with previewId '${previewId}' (hybris page id '${hybrisPageId}')`);
                showPageNotAvailableErrorMessage();
              }
            } else {
              this.previewService.showDetailedErrorDialog(PreviewTranslationKey.NAVIGATION_ERROR_HYBRIS_PAGE_ID_IS_NULL, {
                previewId,
                uid: elementStatus.uid,
              });
            }
          } else {
            this.previewService.showDetailedErrorDialog(PreviewTranslationKey.NAVIGATION_ERROR_ELEMENT_STATUS_HAS_NO_UID, {
              previewId,
              elementStatusString: JSON.stringify(elementStatus),
            });
          }
        }
      });
    });
  }

  private getByUidResponseHandler(caasResponse: any): any {
    const firstCaasDocument = findDocumentsInCaasResponse(caasResponse)[0];
    return iif(
      () => firstCaasDocument == null,
      throwError('The requested page is not available yet (the CaaS response was empty)'),
      of(firstCaasDocument)
    );
  }

  private async fetchPageFromCaas(pageUid: string): Promise<any> {
    const caasClientFactoryObservable = this.caasClientFactory.createCaasClient().pipe(take(1));
    const activeLanguageObservable = this.languageService.getActive().pipe(take(1));
    return combineLatest([caasClientFactoryObservable, activeLanguageObservable])
      .pipe(
        switchMap(([caasClient, lang]) => reExecutable(bind(caasClient.getByUid, caasClient), this.getByUidResponseHandler)(pageUid, lang)),
        switchMap((result) => result),
        first()
      )
      .toPromise()
      .catch(console.error);
  }
}
