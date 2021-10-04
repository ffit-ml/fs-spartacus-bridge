import { CmsStructureModel, ContentSlotData } from '@spartacus/core';

export function getSlotIgnoreCase(cmsPage: CmsStructureModel, slotName: string): ContentSlotData | undefined {
  if (cmsPage && cmsPage.page && cmsPage.page.slots) {
    const matchingKeys = Object.keys(cmsPage.page.slots).filter((key) => key.toLocaleLowerCase() === slotName.toLocaleLowerCase());
    return matchingKeys.length > 0 ? getSlot(cmsPage, matchingKeys[0]) : undefined;
  }
  return undefined;
}

export function getSlot(cmsPage: CmsStructureModel, slotName: string): ContentSlotData | undefined {
  if (cmsPage && cmsPage.page && cmsPage.page.slots) {
    return cmsPage.page.slots[slotName];
  }
  return undefined;
}
