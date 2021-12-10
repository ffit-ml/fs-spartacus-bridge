import { TppStatusService } from '../cms/page/tpp-status-service';
import { Injectable } from '@angular/core';
import { BaseSiteService, GlobalMessageService, Priority } from '@spartacus/core';
import { CaasForbiddenHandler } from './caas-forbidden.handler';
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';

@Injectable({
  providedIn: 'root',
})
export class CaasUnauthorizedHandler extends CaasForbiddenHandler {
  responseStatus = 401;
  errorMessageKey = 'unauthorized';

  constructor(
    fsSpartacusBridgeConfig: FsSpartacusBridgeConfig,
    tppStatusService: TppStatusService,
    baseSiteService: BaseSiteService,
    globalMessageService: GlobalMessageService
  ) {
    super(fsSpartacusBridgeConfig, tppStatusService, baseSiteService, globalMessageService);
  }

  getPriority(): Priority {
    return Priority.NORMAL;
  }
}
