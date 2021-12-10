import { TppStatusService } from '../cms/page/tpp-status-service';
import { BaseSiteService, GlobalMessageService, GlobalMessageType, HttpErrorHandler, Priority } from '@spartacus/core';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';
import { first, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CaasForbiddenHandler extends HttpErrorHandler {
  responseStatus = 403;
  errorMessageKey = 'forbidden';

  constructor(
    private fsSpartacusBridgeConfig: FsSpartacusBridgeConfig,
    private tppStatusService: TppStatusService,
    private baseSiteService: BaseSiteService,
    globalMessageService: GlobalMessageService
  ) {
    super(globalMessageService);
  }

  getPriority(): Priority {
    return Priority.NORMAL;
  }

  handleError(request: HttpRequest<any>, errorResponse: HttpErrorResponse): void {
    this.tppStatusService.isFirstSpiritPreview().pipe(
      take(1)
    ).subscribe((previewMode: boolean) => {
      if (this.isCaasRequest(request)) {
        this.handleCaasError(previewMode);
      } else {
        this.handleNonCaasError();
      }
    });
  }

  private isCaasRequest(request: HttpRequest<any>) {
    let baseSite;
    this.baseSiteService.getActive().pipe(first()).subscribe(
      activeBaseSite => baseSite = activeBaseSite
    );
    return request && request.url.includes(this.fsSpartacusBridgeConfig.bridge[baseSite].caas.baseUrl);
  }

  private handleCaasError(previewMode: boolean) {
    if (previewMode) {
      this.globalMessageService.add({ key: `fsCaas.httpHandlers.${this.errorMessageKey}` }, GlobalMessageType.MSG_TYPE_ERROR);
    }
  }

  private handleNonCaasError() {
    this.globalMessageService.add({ key: `httpHandlers.${this.errorMessageKey}` }, GlobalMessageType.MSG_TYPE_ERROR);
  }
}
