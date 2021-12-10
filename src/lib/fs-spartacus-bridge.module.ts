import { FsCmsPageModule } from './fs/cms/page/fs-cms-page.module'
import { ModuleWithProviders, NgModule, Type } from '@angular/core'
import { CmsConfig, Config, ConfigModule, HttpErrorHandler, provideConfig } from '@spartacus/core'
import { translations } from './fs/translations/translations'
import { FsEditingOverlayComponent } from './fs-editing-overlay/fs-editing-overlay.component'
import { CommonModule } from '@angular/common'
import { OutletModule, PageComponentModule } from '@spartacus/storefront'
import { CaasForbiddenHandler } from './fs/caas/caas-forbidden.handler'
import { CaasUnauthorizedHandler } from './fs/caas/caas-unauthorized.handler'
import { FsEditingAreaComponent } from './fs-editing-area/fs-editing-area.component'
import { FsSpartacusBridgeConfig, FsSpartacusCommonModule } from 'fs-spartacus-common'
import { COUNTRY_PROVIDER_TOKEN } from './fs/cms/page/fs-cms-page.adapter'
import { CountryProvider } from '../types'

@NgModule({
  declarations: [FsEditingOverlayComponent, FsEditingAreaComponent],
  imports: [
    FsSpartacusCommonModule,
    CommonModule,
    FsCmsPageModule,
    ConfigModule.withConfig({
      cmsComponents: {
        FsEditingOverlay: {
          component: FsEditingOverlayComponent,
        },
        FsEditingArea: {
          component: FsEditingAreaComponent,
        },
      },
    } as CmsConfig),
    PageComponentModule,
    OutletModule,
  ],
  exports: [FsEditingOverlayComponent, FsEditingAreaComponent],
  entryComponents: [FsEditingOverlayComponent, FsEditingAreaComponent],
})
export class FsSpartacusBridgeModule {
  static withConfig (config: FsSpartacusBridgeConfig, countryProvider?: Type<CountryProvider>): ModuleWithProviders<FsSpartacusBridgeModule> {
    const module = {
      ngModule: FsSpartacusBridgeModule,
      providers: [
        { provide: FsSpartacusBridgeConfig, useExisting: Config },
        provideConfig(config),
        {
          provide: HttpErrorHandler,
          useClass: CaasForbiddenHandler,
          multi: true,
        },
        {
          provide: HttpErrorHandler,
          useClass: CaasUnauthorizedHandler,
          multi: true,
        },
        provideConfig({
          i18n: { resources: translations },
        }),
      ],
    }
    if (countryProvider) {
      module.providers.push({
        provide: COUNTRY_PROVIDER_TOKEN,
        useClass: countryProvider
      } as any)
    }
    return module
  }
}
