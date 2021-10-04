import { Observable, of } from 'rxjs';
import { CmsStructureModel, PageType } from '@spartacus/core';
import { Injectable } from '@angular/core';
import { LayoutConfig, SlotConfig } from '@spartacus/storefront';

@Injectable({
  providedIn: 'root',
})
export class CmsStructureModelResponseFactory {
  constructor(private storefrontConfig: LayoutConfig) {}

  createCmsStructureModelResponse(fsCmsPage: CmsStructureModel): null | Observable<CmsStructureModel> {
    const fakeOccCmsPage: CmsStructureModel = {
      page: {
        loadTime: fsCmsPage?.page?.loadTime,
        name: fsCmsPage?.page?.name,
        pageId: fsCmsPage?.page?.pageId,
        type: PageType.CONTENT_PAGE,
        slots: {},
      },
      components: [],
    };
    const templateId = fsCmsPage?.page?.template?.toLocaleLowerCase();
    if (templateId && this.storefrontConfig?.layoutSlots != null) {
      const layoutSlotConfig: { layoutId: string; slotConfig: SlotConfig } = Object.keys(this.storefrontConfig.layoutSlots)
        .filter(Boolean)
        .map((layoutKey) => ({ layoutId: layoutKey, slotConfig: this.storefrontConfig.layoutSlots[layoutKey] as SlotConfig }))
        .find((item) => item.layoutId.toLocaleLowerCase() === templateId);
      if (layoutSlotConfig?.slotConfig?.slots) {
        fakeOccCmsPage.page.template = layoutSlotConfig.layoutId;
        layoutSlotConfig.slotConfig.slots.forEach((slot) => {
          fakeOccCmsPage.page.slots[slot] = { components: [] };
        });
        return of(fakeOccCmsPage);
      } else {
        console.warn(
          `Could not find a matching Spartacus layout configuration (or it has no configured slots) for given templateId '${templateId}'`
        );
      }
    } else {
      if (!templateId) {
        console.error(`The requested FS driven page has no "page.template"-property! Page: `, fsCmsPage);
      }
      if (this.storefrontConfig?.layoutSlots == null) {
        console.error(
          `Could not load the layoutSlots-section from the storefront configuration which is required for processing the requested FS driven page!`
        );
      }
    }
    return null;
  }
}
