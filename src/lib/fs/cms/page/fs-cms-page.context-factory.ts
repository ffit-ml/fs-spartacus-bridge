import { PageContext, PageType } from '@spartacus/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FsCmsPageContextFactory {
  createPageContextFor(pageIdentifier: string, pageType: PageType): PageContext {
    return { id: pageIdentifier, type: pageType };
  }
}
