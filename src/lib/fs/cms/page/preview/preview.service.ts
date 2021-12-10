import { PreviewDialogService } from './preview-dialog.service';
import { PreviewTranslationService, PreviewTranslationKey as TranslationKey } from './preview-translation.service';
import { TppWrapperService } from '../tpp-wrapper-service';
import { Injectable } from '@angular/core';
import { nullSafe, errorToString, FsSpartacusBridgeConfig } from 'fs-spartacus-common';
import { FsEditingOverlay } from '../../../../fs-editing-overlay/fs-editing-overlay.component';
import { getFsManagedPageConfigByTemplateId } from '../../../util/helper';
import { BaseSiteService, PageType } from '@spartacus/core';
import { CreatePageResult } from 'fs-tpp-api/snap';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PreviewService {
  constructor(
    private tppWrapperService: TppWrapperService,
    private previewTranslationService: PreviewTranslationService,
    private fsSpartacusBridgeConfig: FsSpartacusBridgeConfig,
    private previewDialogService: PreviewDialogService,
    private baseSiteService: BaseSiteService
  ) {}

  showDetailedErrorDialog(translationKey: TranslationKey, replacements?: { [key: string]: string }): void {
    const [title$, message$, detailedMessage$] = this.previewTranslationService.resolveDialogTexts(translationKey, replacements);
    this.previewDialogService.showDetailedErrorDialog(title$, message$, detailedMessage$);
  }

  showErrorDialog(translationKey: TranslationKey, replacements?: { [key: string]: string }): void {
    const [title$, message$] = this.previewTranslationService.resolveDialogTexts(translationKey, replacements);
    this.previewDialogService.showErrorDialog(title$, message$);
  }

  async isFirstSpiritManagedPage(previewElement: string | undefined): Promise<boolean> {
    const hasPreviewId = previewElement != null && previewElement.length > 0;
    let isManaged = false;
    if (hasPreviewId) {
      const elementStatus = await this.tppWrapperService.getElementStatus(previewElement);
      if (elementStatus != null) {
        const hasId = elementStatus.id != null;
        const hasUid = elementStatus.uid != null;
        const hasName = elementStatus.name != null;
        isManaged = hasId && hasUid && hasName;
      }
    }
    console.log(`The page '${previewElement}' is ${isManaged ? 'already' : 'not'} managed by FirstSpirit.`);
    return isManaged;
  }

  async createPage(pageUid: string, pageTemplate: string, pageType: PageType): Promise<CreatePageResult | undefined> {
    if (pageTemplate != null && pageUid != null && pageType != null) {
      let baseSite;
      this.baseSiteService.getActive().pipe(first()).subscribe(
        activeBaseSite => baseSite = activeBaseSite
      );
      const fsPageConfig = getFsManagedPageConfigByTemplateId(this.fsSpartacusBridgeConfig.bridge[baseSite].firstSpiritManagedPages, pageTemplate);
      console.log(`Found the following configuration for the occ template id '${pageTemplate}': '${JSON.stringify(fsPageConfig)}'`);
      if (fsPageConfig != null) {
        const fsPageTypeMapping = await this.tppWrapperService.getFsPageTypeMapping(pageType, pageTemplate);
        const { fsTemplate, pageFolder } = nullSafe(fsPageTypeMapping, {});
        if (fsTemplate && pageFolder) {
          console.log(`Creating a new FirstSpirit page (path: '${pageFolder}', uid: '${pageUid}', template: '${fsTemplate}')`);
          return (await (this.tppWrapperService.createPage(pageFolder, pageUid, fsTemplate, {
            result: true,
            showFormDialog: false,
            forceUid: true,
          }) as Promise<CreatePageResult>).catch(async (error) => {
            // Since this is the only error OCM throws, we can safely check for the previewId which is always present in this kind of error.
            // OCM will pass the name of the error (as the previewId) so that we can check for the name of the error instead of checking
            // the content ot the error message.
            if (error?.message && error.previewId) {
              this.showDetailedErrorDialog(TranslationKey.DUPLICATE_PAGE_ERROR, {
                duplicatePageErrorMessage: error.message,
                errorMessage: errorToString(error),
              });
              return undefined;
            }
            this.showDetailedErrorDialog(TranslationKey.CREATE_PAGE_UNEXPECTED_ERROR, { errorMessage: errorToString(error) });
          })) as CreatePageResult;
        } else {
          this.showDetailedErrorDialog(TranslationKey.MISSING_FS_PAGE_MAPPING);
        }
      } else {
        this.showDetailedErrorDialog(TranslationKey.MISSING_MANAGED_PAGE_CONFIG);
      }
    } else {
      this.showDetailedErrorDialog(TranslationKey.MISSING_PAGE_OBJECT);
    }
  }

  async createSection(previewElementId: string, componentData: FsEditingOverlay): Promise<void> {
    const slotName = componentData && componentData.slotName ? componentData.slotName.toLocaleLowerCase() : null;
    console.log(`Creating a new section '${slotName}' at element '${previewElementId}'`);
    if (previewElementId && componentData) {
      try {
        const createSectionResult = await this.tppWrapperService.createSection(previewElementId, {
          body: slotName,
          result: true,
        });
        if (createSectionResult && createSectionResult != null && createSectionResult.identifier != null) {
          console.log(`Successfully created section '${createSectionResult.name}' with the identifier '${createSectionResult.identifier}'`);
          return await this.tppWrapperService.triggerRerenderView();
        } else {
          console.log('The creation of the new section was cancelled.');
        }
      } catch (createSectionError) {
        this.showDetailedErrorDialog(TranslationKey.CREATE_SECTION_UNEXPECTED_ERROR, { errorMessage: errorToString(createSectionError) });
      }
    }
  }
}
