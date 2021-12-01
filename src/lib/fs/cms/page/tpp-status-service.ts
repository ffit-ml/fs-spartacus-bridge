import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { Inject, Injectable, NgZone, OnDestroy, PLATFORM_ID, RendererFactory2 } from '@angular/core';
import { CmsService, Page } from '@spartacus/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { NavigationMessageHandlerService } from './navigation-message-handler.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SNAP } from 'fs-tpp-api/snap';

@Injectable({
  providedIn: 'root',
})
export class TppStatusService implements OnDestroy {
  private readonly firstSpiritPreview: Observable<boolean>;
  private subs$ = new Subscription();
  private TPP_SNAP: SNAP = isPlatformBrowser(this.platformId) ? require('fs-tpp-api/snap') : null;

  constructor(
    private cmsService: CmsService,
    private ngZone: NgZone,
    private navigationMessageHandlerService: NavigationMessageHandlerService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document,
    @Inject(PLATFORM_ID) private platformId: string
  ) {
    const isConnected = new BehaviorSubject(false);
    const renderer = this.rendererFactory.createRenderer(null, null);
    if (isPlatformBrowser(platformId)) {
      this.TPP_SNAP.onInit((success: boolean) => this.ngZone.run(() => isConnected.next(success)));
    }
    else {
      isConnected.next(false);
    }
    this.firstSpiritPreview = isConnected.pipe(distinctUntilChanged());
    this.subs$.add(this.firstSpiritPreview.subscribe(async (isFirstSpiritPreview) => {
      if (isFirstSpiritPreview) {
        renderer.setAttribute(this.document.body, 'dnd-orient', 'horizontal');
        this.overrideTranslateButton();
        this.disableCreateComponentButton();
        this.navigationMessageHandlerService.initialize();
      } else {
        renderer.removeAttribute(this.document.body, 'dnd-orient');
        this.navigationMessageHandlerService.destroy();
      }
    }));

    combineLatest([this.firstSpiritPreview, this.cmsService.getCurrentPage()]).subscribe(async (params) => {
      await this.setPagePreviewElementInPreview(...params);
    });
  }

  ngOnDestroy(): void {
    if(this.subs$) {
      this.subs$.unsubscribe()
    }
  }

  private async setPagePreviewElementInPreview(preview: boolean, page: Page): Promise<void> {
    if (preview && page && this.TPP_SNAP) {
      await this.TPP_SNAP.setPreviewElement((page.properties || {}).previewId || null);
    }
  }

  isFirstSpiritPreview(): Observable<boolean> {
    return this.firstSpiritPreview;
  }

  private async getProjectApps(): Promise<any> {
    return await this.TPP_SNAP.execute('script:tpp_list_projectapps');
  }

  private async overrideTranslateButton(): Promise<void> {
    const projectApps = await this.getProjectApps();
    if (projectApps.some((projectApp) => projectApp.includes('TranslationStudio'))) {
      this.TPP_SNAP.overrideDefaultButton('translate', {
        getItems: () => [],
        execute: ({ status: { id: elementId }, language }) =>
          this.TPP_SNAP.execute('script:translationstudio_ocm_translationhelper', { language, elementId }),
      });
    }
  }

  /*
  remove create-component button in content creator since it is concealed by edit-component buttons.
  buttons will be fixed with SPART-
  */
  private async disableCreateComponentButton(): Promise<void> {
    this.TPP_SNAP.overrideDefaultButton('create-component', null);
  }
}
