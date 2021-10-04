import { Injectable } from '@angular/core';
import { CmsStructureModelMergerFactory } from './cms-structure-model-merger-factory';
import { PipelineStep } from '../pipeline-step';
import { CmsStructureModel } from '@spartacus/core';

@Injectable({
  providedIn: 'root',
})
export class CmsStructureModelMergerPipelineStep implements PipelineStep {
  constructor(private fsCmsPageMergerFactory: CmsStructureModelMergerFactory) {}

  execute(occCmsStructureModel: CmsStructureModel, fsCmsStructureModel: CmsStructureModel): CmsStructureModel {
    return this.mergeOccCmsPageWithFsCmsPage(occCmsStructureModel, fsCmsStructureModel);
  }

  private mergeOccCmsPageWithFsCmsPage(occCmsStructureModel: CmsStructureModel, fsCmsStructureModel: CmsStructureModel) {
    const pageTemplate = occCmsStructureModel?.page?.properties?.fsPageTemplate || occCmsStructureModel.page.template;
    const fsCmsPageMerger = this.fsCmsPageMergerFactory.createFsCmsPageMerger(pageTemplate);
    return fsCmsPageMerger ? fsCmsPageMerger.merge(occCmsStructureModel, fsCmsStructureModel) : occCmsStructureModel;
  }
}
