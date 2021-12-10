import { TppStatusService } from '../cms/page/tpp-status-service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CaasAccessData } from './caas-access-data';
import { CaasCollection } from './caas-collection';
import { CaasClient } from './caas-client';
import { combineLatest, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';
import { BaseSiteService } from '@spartacus/core';

@Injectable({
  providedIn: 'root',
})
export class CaasClientFactory {
  constructor(private config: FsSpartacusBridgeConfig,
              private httpClient: HttpClient,
              private tppStatusService: TppStatusService,
              private baseSiteService: BaseSiteService
  ) {}

  createCaasClient(): Observable<CaasClient> {
    return combineLatest([this.tppStatusService.isFirstSpiritPreview(), this.baseSiteService.getActive()]).pipe(
      map(([ocm, activeBaseSite]) => {
        const caasCollectionAccessData = new CaasAccessData(
          this.config.bridge[activeBaseSite].caas.baseUrl,
          this.config.bridge[activeBaseSite].caas.tenantId,
          this.config.bridge[activeBaseSite].caas.project,
          ocm ? CaasCollection.PREVIEW_CONTENT : CaasCollection.RELEASE_CONTENT,
          this.config.bridge[activeBaseSite].caas.apiKey
        );

        return new CaasClient(caasCollectionAccessData, this.httpClient);
      })
    );
  }
}
