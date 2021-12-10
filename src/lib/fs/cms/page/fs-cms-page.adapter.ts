import { CmsPageAdapter, CmsStructureModel, ConverterService, LanguageService, PageContext } from '@spartacus/core';
import { combineLatest, Observable, of } from 'rxjs'
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core'
import { defaultIfEmpty, filter, map, switchMap, take, switchAll } from 'rxjs/operators';
import { FS_CMS_PAGE_LANGUAGE_FALLBACK_REPLACER, FS_CMS_PAGE_NORMALIZER, FS_CMS_PAGE_PREPARER } from './fs-cms-page.converter';
import { CaasClientFactory } from '../../caas/caas-client.factory';
import { extractPageUniqueId } from '../../util/occ-cms-pages';
import { findDocumentsInCaasResponse } from '../../util/helper';
import { CountryProvider } from '../../../../types'

export const COUNTRY_PROVIDER_TOKEN = new InjectionToken<CountryProvider>('CountryProvider')

@Injectable({
  providedIn: 'root',
})
export class FsCmsPageAdapter extends CmsPageAdapter {
  private seoUrlToUidMap: Map<string, string>;

  constructor(private converter: ConverterService, private languageService: LanguageService, private caasClientFactory: CaasClientFactory,
              @Optional() @Inject(COUNTRY_PROVIDER_TOKEN) private countryProvider: CountryProvider) {
    super();
    this.seoUrlToUidMap = new Map();
  }

  load(pageContext: PageContext): Observable<CmsStructureModel> {
    // If the user switches the language in the storefront, this load method will be called by Spartacus.
    // Therefore, we must not listen to all items that are emitted by the language service.
    // Otherwise the observables of all already visited pages will be triggered to fetch content for the new language.
    // Therefore we only take one emitted value from the observables.
    // As soon as the language changes, this method will be called again and we take the updated value.
    const caasClientFactoryObservable = this.caasClientFactory.createCaasClient().pipe(take(1));
    const activeLanguageObservable = this.languageService.getActive().pipe(take(1));
    const activeCountryObservable = this.countryProvider?.getActive()?.pipe(take(1)) ?? of('')
    return combineLatest([caasClientFactoryObservable, activeLanguageObservable, activeCountryObservable]).pipe(
      switchMap(([caasClient, activeLanguage, activeCountry]) => {
        // The pageContext may contain the page's seo url as id (and not its FS uid).
        // Since switching the language is easier to handle for us with the page's fs uid we store
        // this information in the "seoUrlToUidMap" for each processed page that has a seo url
        // and look it up in each call.
        const extractedPageId = extractPageUniqueId(pageContext);
        if (this.seoUrlToUidMap.has(extractedPageId.firstSpiritPageId)) {
          extractedPageId.firstSpiritPageId = this.seoUrlToUidMap.get(extractedPageId.firstSpiritPageId);
        }
        return caasClient.getByUid(extractedPageId.firstSpiritPageId, activeLanguage, extractedPageId.pageId, activeCountry).pipe(
          map((caasResponse) => {
            const caasResponses = findDocumentsInCaasResponse(caasResponse);
            let resultResponse = caasResponses[0];
            caasResponses.forEach((item) => {
              const seoUrl = item?.page?.formData?.pt_seoUrl?.value;
              if (typeof seoUrl === 'string' && seoUrl !== '') {
                this.seoUrlToUidMap.set(seoUrl, item.uid);
              }
              if ((activeCountry && (item?.locale?.country === activeCountry && item?.locale?.language === activeLanguage)) || item?.locale?.language === activeLanguage) {
                resultResponse = item;
              }
            });
            const { language } = resultResponse?.locale || {};
            if (typeof language === 'string' && language !== '' && activeLanguage !== language) {
              this.languageService.setActive(resultResponse.locale.language);
            }
            return resultResponse;
          }),
          filter((caasDocument) => caasDocument !== undefined),
          this.converter.pipeable(FS_CMS_PAGE_LANGUAGE_FALLBACK_REPLACER),
          switchAll(),
          this.converter.pipeable(FS_CMS_PAGE_PREPARER),
          switchAll(),
          this.converter.pipeable(FS_CMS_PAGE_NORMALIZER),
          defaultIfEmpty()
        );
      })
    );
  }
}
