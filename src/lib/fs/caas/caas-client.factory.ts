import { TppStatusService } from '../cms/page/tpp-status-service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CaasClient } from './caas-client';
import { combineLatest, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';
import { BaseSiteService } from '@spartacus/core';
import { createCaasAccessData } from '../util/helper';

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
        const caasCollectionAccessData = createCaasAccessData(this.config, activeBaseSite, ocm)

        return new CaasClient(caasCollectionAccessData, this.httpClient);
      })
    );
  }
}
