import { switchAll } from 'rxjs/operators';
import { CmsPageAdapter, CmsStructureModel, ConverterService, PageContext } from '@spartacus/core';
import { TppWrapperService } from './tpp-wrapper-service';
import { Observable, Subject } from 'rxjs';
import { FsCmsPageInterface } from './fs-cms-page.interface';
import {
  FS_CMS_PAGE_LANGUAGE_FALLBACK_REPLACER, FS_CMS_PAGE_NORMALIZER, FS_CMS_PAGE_PREPARER
} from './fs-cms-page.converter';
import { Inject, Injectable, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class FsCmsPageChangeAdapter extends CmsPageAdapter {
  private pageSubject: Subject<FsCmsPageInterface>;

  constructor(
    private tppWrapperService: TppWrapperService,
    private converter: ConverterService,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document
  ) {
    super();
    this.pageSubject = new Subject();
    this.tppWrapperService.onRerenderView(async () => {
      await this.ngZone.run(async () => {
        const previewElement = await this.tppWrapperService.getPreviewElement();
        // Let the FS render the updated page content and do not fetch it from the CaaS,
        // because it might not have been deployed yet.
        this.disable()
        const renderResult = await this.tppWrapperService.renderElement(previewElement);
        this.enable()
        this.pageSubject.next(renderResult);
      });
    });
  }

  load(pageContext: PageContext): Observable<CmsStructureModel> {
    return this.pageSubject.pipe(
      this.converter.pipeable(FS_CMS_PAGE_LANGUAGE_FALLBACK_REPLACER),
      switchAll(),
      this.converter.pipeable(FS_CMS_PAGE_PREPARER),
      switchAll(),
      this.converter.pipeable(FS_CMS_PAGE_NORMALIZER)
    );
  }

  private disable = (el = this.document.body, spinner = el !== this.document.body) => {
    const hasStyles = this.document.head.querySelector('#fs-spinner-style');
    if(!hasStyles) {
      console.log("wird hinzugefügert");
      const css = `
      .fs-spinner-veil, .fs-spinner-wrapper {
        position: fixed;
        height: 100vh;
        width: 100vw;
        top: 0;
        left: 0;
      }

      .fs-spinner-veil {
        background: #000;
        opacity: 0.5;
      }

      .fs-spinner-wrapper {
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .fs-spinner {
        height: 100px;
        width: 100px;
      }

      .fs-spinner:after {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        border-style: solid;
        border-width: 0.5rem;
        border-color: #3288C3 white white white;
        border-radius: 50%;
        transform-origin: center;
        animation: spinner-spin 1s linear infinite;
      }

      @keyframes spinner-spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      `
      const styleTag = this.document.createElement('style');
      styleTag.id = "fs-spinner-style"
      styleTag.appendChild(this.document.createTextNode(css));
      this.document.head.appendChild(styleTag)
    }
    el.insertAdjacentHTML(
      'beforeend',
      `
      <div class="fs-spinner-wrapper">
        <div class="fs-spinner-veil"></div>
        <div class="fs-spinner"></div>
      </div>
        `
    );
  };

    private enable = (el = this.document.body) => {
      const spinner = el.querySelector('.fs-spinner-wrapper');
      if(spinner) spinner.parentElement.removeChild(spinner);
    };
}
