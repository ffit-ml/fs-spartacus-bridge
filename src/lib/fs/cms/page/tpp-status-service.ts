import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import TPP_SNAP from 'fs-tpp-api/snap';
import { Inject, Injectable, NgZone, RendererFactory2 } from '@angular/core';
import { CmsService, Page } from '@spartacus/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { NavigationMessageHandlerService } from './navigation-message-handler.service';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TppStatusService {
  private readonly firstSpiritPreview: Observable<boolean>;

  constructor(
    private cmsService: CmsService,
    private ngZone: NgZone,
    private navigationMessageHandlerService: NavigationMessageHandlerService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document
  ) {
    const isConnected = new BehaviorSubject(false);
    const renderer = this.rendererFactory.createRenderer(null, null);
    TPP_SNAP.onInit((success: boolean) => this.ngZone.run(() => isConnected.next(success)));
    this.firstSpiritPreview = isConnected.pipe(distinctUntilChanged());
    this.firstSpiritPreview.subscribe(async (isFirstSpiritPreview) => {
      if (isFirstSpiritPreview) {
        renderer.setAttribute(this.document.body, 'dnd-orient', 'horizontal');
        this.overrideTranslateButton();
        this.disableCreateComponentButton();
        this.navigationMessageHandlerService.initialize();
      } else {
        renderer.removeAttribute(this.document.body, 'dnd-orient');
        this.navigationMessageHandlerService.destroy();
      }
    });

    combineLatest([this.firstSpiritPreview, this.cmsService.getCurrentPage()]).subscribe(async (params) => {
      await this.setPagePreviewElementInPreview(...params);
    });
  }

  private async setPagePreviewElementInPreview(preview: boolean, page: Page): Promise<void> {
    if (preview && page) {
      await TPP_SNAP.setPreviewElement((page.properties || {}).previewId || null);
    }
  }

  isFirstSpiritPreview(): Observable<boolean> {
    return this.firstSpiritPreview;
  }

  private async getProjectApps(): Promise<any> {
    return await TPP_SNAP.execute('script:tpp_list_projectapps');
  }

  private async overrideTranslateButton(): Promise<void> {
    const projectApps = await this.getProjectApps();
    if (projectApps.some((projectApp) => projectApp.includes('TranslationStudio'))) {
      TPP_SNAP.overrideDefaultButton('translate', {
        getItems: () => [],
        execute: ({ status: { id: elementId }, language }) =>
          TPP_SNAP.execute('script:translationstudio_ocm_translationhelper', { language, elementId }),
      });
    }
  }

  /*
  remove create-component button in content creator since it is concealed by edit-component buttons.
  buttons will be fixed with SPART-
  */
  private async disableCreateComponentButton(): Promise<void> {
    TPP_SNAP.overrideDefaultButton('create-component', null);
  }
}
