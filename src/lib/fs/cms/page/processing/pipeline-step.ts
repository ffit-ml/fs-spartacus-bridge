import { CmsStructureModel } from '@spartacus/core';

export interface PipelineStep {
  /**
   * Executes an action on occCmsStructureModel and returns the result.
   */
  execute(occCmsStructureModel: CmsStructureModel, fsCmsStructureModel?: CmsStructureModel | null): CmsStructureModel;
}
