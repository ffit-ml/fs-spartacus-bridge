import { PipelineStep } from './pipeline-step';
import { CmsStructureModel } from '@spartacus/core';

export class Pipeline {
  private pipelineSteps: PipelineStep[];

  constructor(pipelineSteps: PipelineStep[]) {
    this.pipelineSteps = pipelineSteps || [];
  }

  /**
   * Runs a number of processing tasks on occCmsStructureModel and returns the result.
   */
  execute(occCmsStructureModel: CmsStructureModel, fsCmsStructureModel: CmsStructureModel): CmsStructureModel {
    return this.pipelineSteps.reduce(
      (updatedOccCmsStructureModel, nextPipelineStep) => nextPipelineStep.execute(updatedOccCmsStructureModel, fsCmsStructureModel),
      occCmsStructureModel
    );
  }
}
