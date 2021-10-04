import { TppStatusService } from '../cms/page/tpp-status-service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CaasAccessData } from './caas-access-data';
import { CaasCollection } from './caas-collection';
import { CaasClient } from './caas-client';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';

@Injectable({
  providedIn: 'root',
})
export class CaasClientFactory {
  constructor(private config: FsSpartacusBridgeConfig, private httpClient: HttpClient, private tppStatusService: TppStatusService) {}

  createCaasClient(): Observable<CaasClient> {
    return this.tppStatusService.isFirstSpiritPreview().pipe(
      map((ocm) => {
        const caasCollectionAccessData = new CaasAccessData(
          this.config.caas.baseUrl,
          this.config.caas.tenantId,
          this.config.caas.project,
          ocm ? CaasCollection.PREVIEW_CONTENT : CaasCollection.RELEASE_CONTENT,
          this.config.caas.apiKey
        );

        return new CaasClient(caasCollectionAccessData, this.httpClient);
      })
    );
  }
}
