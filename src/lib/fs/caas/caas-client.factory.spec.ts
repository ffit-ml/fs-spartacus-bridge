import { TppStatusService } from '../cms/page/tpp-status-service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigModule } from '@spartacus/core';
import { of } from 'rxjs';

import { FsSpartacusBridgeModule } from '../../fs-spartacus-bridge.module';
import { CaasClientFactory } from './caas-client.factory';

describe('CaasCollectionClientFactory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FsSpartacusBridgeModule.withConfig({
          caas: { baseUrl: 'https://baseUrl', project: 'project', apiKey: 'apiKey', tenantId: 'defaultTenant' },
          firstSpiritManagedPages: [],
        }),
        ConfigModule.forRoot(),
      ],
    });
  });

  it('should build a client for preview mode', (done) => {
    TestBed.overrideProvider(TppStatusService, {
      useValue: { isFirstSpiritPreview: () => of(true) } as TppStatusService,
    });

    performAndVerifyTestRequest('https://baseUrl/defaultTenant/project.preview.content', done);
  });

  it('should build a client for live mode', (done) => {
    TestBed.overrideProvider(TppStatusService, {
      useValue: { isFirstSpiritPreview: () => of(false) } as TppStatusService,
    });

    performAndVerifyTestRequest('https://baseUrl/defaultTenant/project.release.content', done);
  });

  function performAndVerifyTestRequest(caasUrl: string, done: DoneFn) {
    const clientObservable: CaasClientFactory = TestBed.inject(CaasClientFactory);
    clientObservable.createCaasClient().subscribe((client) => {
      client.getByUid('myDocument', 'de').subscribe((res) => {
        // We need to subscribe, otherwise the http request will not be fired,
        // because HttpClient returns a cold observable
      });

      const httpMock = TestBed.inject(HttpTestingController); // Must get AFTER overriding the provider!
      httpMock.expectOne((request) => request.url.startsWith(caasUrl));
      httpMock.verify();
      done(); // Important! Otherwise failing test might not be recognized, due to the async execution.
    });
  }
});
