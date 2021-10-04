import { Injectable, Injector } from '@angular/core';
import { CmsStructureModelMerger } from './cms-structure-model-merger';
import { getFsManagedPageConfigByTemplateId } from '../../../../util/helper';
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';

@Injectable({
  providedIn: 'root',
})
export class CmsStructureModelMergerFactory {
  constructor(private fsSpartacusBridgeConfig: FsSpartacusBridgeConfig, private injector: Injector) {}

  createFsCmsPageMerger(pageTemplate: string): CmsStructureModelMerger | undefined {
    const firstSpiritManagedPage = getFsManagedPageConfigByTemplateId(this.fsSpartacusBridgeConfig.firstSpiritManagedPages, pageTemplate);
    return firstSpiritManagedPage ? new CmsStructureModelMerger(firstSpiritManagedPage, this.injector) : undefined;
  }
}
