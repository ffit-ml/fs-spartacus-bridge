import { Injectable, Injector } from '@angular/core';
import { CmsStructureModelMerger } from './cms-structure-model-merger';
import { getFsManagedPageConfigByTemplateId } from '../../../../util/helper';
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';
import { BaseSiteService } from '@spartacus/core';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CmsStructureModelMergerFactory {
  constructor(private fsSpartacusBridgeConfig: FsSpartacusBridgeConfig,
              private baseSiteService: BaseSiteService,
              private injector: Injector
  ) {}

  createFsCmsPageMerger(pageTemplate: string): CmsStructureModelMerger | undefined {
    let baseSite;
    this.baseSiteService.getActive().pipe(first()).subscribe(
      activeBaseSite => baseSite = activeBaseSite
    );
    const firstSpiritManagedPage = getFsManagedPageConfigByTemplateId(
      this.fsSpartacusBridgeConfig.bridge[baseSite].firstSpiritManagedPages, pageTemplate
    );
    return firstSpiritManagedPage ? new CmsStructureModelMerger(firstSpiritManagedPage, this.injector) : undefined;
  }
}
