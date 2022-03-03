import { PipelineStep } from '../pipeline-step';
import { BaseSiteService, CmsStructureModel } from '@spartacus/core';
import { getSlotIgnoreCase } from '../../../../util/content-slots';
import { Injectable } from '@angular/core';
import { FsCmsPageComponentInjector } from '../fs-cms-page-component-injector';
import { FsEditingOverlayComponent } from '../../../../../fs-editing-overlay/fs-editing-overlay.component';
import { getFsManagedPageConfigByTemplateId } from '../../../../util/helper';
import { FsSpartacusBridgeConfig, Optional } from 'fs-spartacus-common';
import { first } from 'rxjs/operators';

/**
 * A {@link Pipeline} step that injects the EditingOverlay component to a ContentSlot if this is empty.
 */
@Injectable({
  providedIn: 'root',
})
export class FsEditingOverlayInjectorPipelineStep implements PipelineStep {
  constructor(
    private fsComponentInjector: FsCmsPageComponentInjector,
    private fsSpartacusBridgeConfig: FsSpartacusBridgeConfig,
    private baseSiteService: BaseSiteService
  ) {}

  /**
   * This methode injects the editing overlay component to a content slot if it is empty.
   *
   * @param {CmsStructureModel} occCmsStructureModel The page generated by the OCC CMS.
   * @param {CmsStructureModel} fsCmsStructureModel The page generated by FirstSpirit.
   * @return {CmsStructureModel} The manipulated page.
   * @memberof FsEditingOverlayInjectorPipelineStep
   */
  execute(occCmsStructureModel: CmsStructureModel, fsCmsStructureModel: CmsStructureModel): CmsStructureModel {
    return this.addFsEditingOverlaysToOccCmsPage(occCmsStructureModel, fsCmsStructureModel);
  }

  private addFsEditingOverlaysToOccCmsPage(
    occCmsStructureModel: CmsStructureModel,
    fsCmsStructureModel: CmsStructureModel
  ): CmsStructureModel {
    const slots = this.findSlotsThatRequireFsEditingOverlay(occCmsStructureModel, fsCmsStructureModel);
    return this.fsComponentInjector.addCmsPageComponents(occCmsStructureModel, slots);
  }

  private findSlotsThatRequireFsEditingOverlay(occCmsStructureModel: CmsStructureModel, fsCmsStructureModel: CmsStructureModel): string[] {
    const firstSpiritManagedPage = this.findFirstSpiritManagedPage(occCmsStructureModel, fsCmsStructureModel);
    if (firstSpiritManagedPage) {
      // If the fs page does not exist, we overlay each configured fs managed slot.
      // But if a page exists and a slot is not defined in the fs page, there is no body in the FirstSpirit page and it can not be edited.
      const slots = fsCmsStructureModel
        ? firstSpiritManagedPage.slots.filter((fsManagedSlot) => this.requiresFsEditingOverly(fsCmsStructureModel, fsManagedSlot.name))
        : firstSpiritManagedPage.slots;
      return slots.map((slot) => slot.name);
    } else {
      return [];
    }
  }

  private findFirstSpiritManagedPage(occCmsPage: CmsStructureModel, fsCmsPage: CmsStructureModel) {
    let baseSite;
    this.baseSiteService.getActive().pipe(first()).subscribe(
      activeBaseSite => baseSite = activeBaseSite
    );
    return getFsManagedPageConfigByTemplateId(
      this.fsSpartacusBridgeConfig.bridge[baseSite].firstSpiritManagedPages,
      this.tryGetPageTemplate(occCmsPage) || this.tryGetPageTemplate(fsCmsPage)
    );
  }

  private tryGetPageTemplate(cmsStructureModel: CmsStructureModel): Optional<string> {
    return cmsStructureModel?.page?.properties?.fsPageTemplate || cmsStructureModel?.page?.template || null;
  }

  private requiresFsEditingOverly(fsCmsStructureModel: CmsStructureModel, slotName: string) {
    const slot = getSlotIgnoreCase(fsCmsStructureModel, slotName);
    return slot && (!Array.isArray(slot.components) || slot.components.length === 0);
  }
}

/**
 * A factory function that creates the {@link FsEditingOverlayInjectorPipelineStep} from a given FsSpartacusBridgeConfig and BaseSiteService.
 *
 * @export
 * @param {FsSpartacusBridgeConfig} fsSpartacusBridgeConfig The fsSpartacusBridgeConfig from which the step will be created.
 * @param {BaseSiteService} baseSiteService The BaseSiteService to check for the active base site.
 * @return {FsEditingOverlayInjectorPipelineStep} The created FsEditingOverlayInjectorPipelineStep instance.
 */
export function createFsEditingOverlayInjectorPipelineStep(
  fsSpartacusBridgeConfig: FsSpartacusBridgeConfig,
  baseSiteService: BaseSiteService
): FsEditingOverlayInjectorPipelineStep {
  const fsComponentInjector: FsCmsPageComponentInjector = new FsCmsPageComponentInjector(FsEditingOverlayComponent.TYPE_CODE);
  return new FsEditingOverlayInjectorPipelineStep(fsComponentInjector, fsSpartacusBridgeConfig, baseSiteService);
}
