import { Injectable } from '@angular/core';
import { TranslationService } from '@spartacus/core';
import { Observable } from 'rxjs';

export enum PreviewTranslationKey {
  CREATE_SECTION_UNEXPECTED_ERROR = 'preview.dialogs.createSection.unexpectedError',
  CREATE_PAGE_UNEXPECTED_ERROR = 'preview.dialogs.createPage.unexpectedError',
  DUPLICATE_PAGE_ERROR = 'preview.dialogs.createPage.duplicatePageError',
  MISSING_MANAGED_PAGE_CONFIG = 'preview.dialogs.createPage.missingManagedPageConfiguration',
  MISSING_PAGE_OBJECT = 'preview.dialogs.createPage.missingPageObject',
  MISSING_FS_PAGE_MAPPING = 'preview.dialogs.createPage.missingFsPageMapping',
  MISSING_PAGE_DATA = 'preview.dialogs.createPage.missingPageData',
  MISSING_ROUTING_DATA = 'preview.dialogs.createPage.missingRoutingData',
  REQUESTED_CAAS_PAGE_NOT_AVAILABLE_YET = 'preview.dialogs.createPage.requestedCaasPageNotAvailableYet',
  NAVIGATION_ERROR_HYBRIS_PAGE_ID_IS_NULL = 'preview.dialogs.navigationError.hybrisPageIdIsNull',
  NAVIGATION_ERROR_ELEMENT_STATUS_HAS_NO_UID = 'preview.dialogs.navigationError.elementStatusHasNoUid',
}

@Injectable({
  providedIn: 'root',
})
export class PreviewTranslationService {
  constructor(private translationService: TranslationService) {}

  private resolveDialogTitle(key: string, replacements?: { [key: string]: string }): Observable<string> {
    return this.translationService.translate(`${key}.title`, replacements);
  }

  private resolveDialogMessage(key: string, replacements?: { [key: string]: string }): Observable<string> {
    return this.translationService.translate(`${key}.message`, replacements);
  }

  private resolveDialogDetailedMessage(key: string, replacements?: { [key: string]: string }): Observable<string> {
    return this.translationService.translate(`${key}.detailedMessage`, replacements);
  }

  resolveDialogTexts(key: PreviewTranslationKey, replacements?: { [key: string]: string }): Array<Observable<string>> {
    return [
      this.resolveDialogTitle(key, replacements),
      this.resolveDialogMessage(key, replacements),
      this.resolveDialogDetailedMessage(key, replacements),
    ];
  }
}
