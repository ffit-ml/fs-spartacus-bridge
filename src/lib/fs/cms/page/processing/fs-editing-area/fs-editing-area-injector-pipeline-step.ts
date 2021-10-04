import { PipelineStep } from '../pipeline-step';
import { CmsStructureModel, ContentSlotData } from '@spartacus/core';
import { getSlotIgnoreCase } from '../../../../util/content-slots';
import { Injectable } from '@angular/core';
import { FsCmsPageComponentInjector } from '../fs-cms-page-component-injector';
import { FsEditingAreaComponent } from '../../../../../fs-editing-area/fs-editing-area.component';
import { getFsManagedPageConfigByTemplateId } from '../../../../util/helper';
import { FsSpartacusBridgeConfig, Optional } from 'fs-spartacus-common';

@Injectable({
  providedIn: 'root',
})
export class FsEditingAreaInjectorPipelineStep implements PipelineStep {
  constructor(private fsComponentInjector: FsCmsPageComponentInjector, private fsSpartacusBridgeConfig: FsSpartacusBridgeConfig) {}

  execute(occCmsStructureModel: CmsStructureModel, fsCmsStructureModel: CmsStructureModel): CmsStructureModel {
    return this.addFsEditingAreasToOccCmsPage(occCmsStructureModel, fsCmsStructureModel);
  }

  private addFsEditingAreasToOccCmsPage(
    occCmsStructureModel: CmsStructureModel,
    fsCmsStructureModel: CmsStructureModel
  ): CmsStructureModel {
    const slots = this.findSlotsThatRequireFsEditingArea(occCmsStructureModel, fsCmsStructureModel);
    return this.fsComponentInjector.addCmsPageComponents(occCmsStructureModel, slots);
  }

  private findSlotsThatRequireFsEditingArea(occCmsPage: CmsStructureModel, fsCmsPage: CmsStructureModel): string[] {
    const fsManagedPage = this.findFirstSpiritManagedPage(occCmsPage, fsCmsPage);
    if (fsManagedPage) {
      let slots = fsManagedPage.slots.map((slot) => slot.name);
      if (fsCmsPage) {
        slots = slots.filter((fsManagedSlotName) => this.isSlotDefinedButEmpty(fsCmsPage, fsManagedSlotName));
      }

      if (occCmsPage) {
        slots = slots.filter((fsManagedSlotName) => this.isSlotUndefinedOrEmpty(occCmsPage, fsManagedSlotName));
      }
      return slots;
    }
    return [];
  }

  private findFirstSpiritManagedPage(occCmsPage: CmsStructureModel, fsCmsPage: CmsStructureModel) {
    return getFsManagedPageConfigByTemplateId(
      this.fsSpartacusBridgeConfig.firstSpiritManagedPages,
      this.tryGetPageTemplate(occCmsPage) || this.tryGetPageTemplate(fsCmsPage)
    );
  }

  private tryGetPageTemplate(cmsStructureModel: CmsStructureModel): Optional<string> {
    return cmsStructureModel?.page?.properties?.fsPageTemplate || cmsStructureModel?.page?.template || null;
  }

  private isSlotDefinedButEmpty(cmsStructureModel: CmsStructureModel, slotName: string) {
    const slot = getSlotIgnoreCase(cmsStructureModel, slotName);
    return getSlotIgnoreCase(cmsStructureModel, slotName) && this.isContentSlotEmpty(slot);
  }

  private isSlotUndefinedOrEmpty(cmsStructureModel: CmsStructureModel, slotName: string) {
    const slot = getSlotIgnoreCase(cmsStructureModel, slotName);
    return !getSlotIgnoreCase(cmsStructureModel, slotName) || this.isContentSlotEmpty(slot);
  }

  private isContentSlotEmpty(contentSlot: ContentSlotData): boolean {
    return !Array.isArray(contentSlot.components) || contentSlot.components.length === 0;
  }
}

export function createFsEditingAreaInjectorPipelineStep(fsSpartacusBridgeConfig: FsSpartacusBridgeConfig) {
  const fsComponentInjector: FsCmsPageComponentInjector = new FsCmsPageComponentInjector(FsEditingAreaComponent.TYPE_CODE);
  return new FsEditingAreaInjectorPipelineStep(fsComponentInjector, fsSpartacusBridgeConfig);
}
