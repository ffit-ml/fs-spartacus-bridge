import { TppStatusService } from '../cms/page/tpp-status-service';
import { HttpRequest } from '@angular/common/http';
import { GlobalMessageService, GlobalMessageType } from '@spartacus/core';
import { of } from 'rxjs';

import { CaasForbiddenHandler } from './caas-forbidden.handler';

import createSpy = jasmine.createSpy;
import { FsSpartacusBridgeConfig } from 'fs-spartacus-common';
class MockMessageService extends GlobalMessageService {
  add = createSpy('GlobalMessageService.add');
}

describe('CaasForbiddenHandler', () => {
  let messageService: GlobalMessageService;
  const config: FsSpartacusBridgeConfig = {
    firstSpiritManagedPages: [],
    caas: {
      baseUrl: 'https://caas-url',
      apiKey: '',
      project: '',
      tenantId: '',
    },
  };

  beforeEach(() => {
    messageService = new MockMessageService(null);
  });

  function expectErrorMessageAndFinishWithFunction(messageKey: string, done: () => void) {
    expect(messageService.add).toHaveBeenCalledWith({ key: messageKey }, GlobalMessageType.MSG_TYPE_ERROR);
    done();
  }

  it('should handle non caas authentication errors by showing the default forbidden message', (done) => {
    const tppStatusService = { isFirstSpiritPreview: () => of(false) } as TppStatusService;
    const caasForbiddenHandler = new CaasForbiddenHandler(config, tppStatusService, messageService);
    caasForbiddenHandler.handleError(new HttpRequest<any>('GET', 'https://non-caas-url', null, null), null);

    tppStatusService.isFirstSpiritPreview().subscribe(() => expectErrorMessageAndFinishWithFunction('httpHandlers.forbidden', done));
  });

  describe('should handle caas authentication erros', () => {
    it('in the FirstSpirit preview by showing a custom forbidden message', (done) => {
      const tppStatusService = { isFirstSpiritPreview: () => of(true) } as TppStatusService;
      const caasForbiddenHandler = new CaasForbiddenHandler(config, tppStatusService, messageService);
      caasForbiddenHandler.handleError(new HttpRequest<any>('GET', config.caas.baseUrl, null, null), null);

      tppStatusService
        .isFirstSpiritPreview()
        .subscribe(() => expectErrorMessageAndFinishWithFunction('fsCaas.httpHandlers.forbidden', done));
    });

    it('in the live storefront by showing no message', (done) => {
      const tppStatusService = { isFirstSpiritPreview: () => of(false) } as TppStatusService;
      const caasForbiddenHandler = new CaasForbiddenHandler(config, tppStatusService, messageService);
      caasForbiddenHandler.handleError(new HttpRequest<any>('GET', config.caas.baseUrl, null, null), null);

      tppStatusService.isFirstSpiritPreview().subscribe(() => {
        expect(messageService.add).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
