import { ContentSlotData } from '@spartacus/core';
import { InjectionToken, Injectable } from '@angular/core';
import { merge } from 'immutable';
import { MergeStrategy } from 'fs-spartacus-common';

export const PREPEND = new InjectionToken<MergeStrategy<ContentSlotData>>('PrependMergeStrategy');

@Injectable()
export class Prepend implements MergeStrategy<ContentSlotData> {
  merge(aContentSlot: ContentSlotData, anotherContentSlot: ContentSlotData): ContentSlotData {
    return {
      components: merge(anotherContentSlot.components || [], aContentSlot.components || []),
      properties: merge(aContentSlot.properties || {}, anotherContentSlot.properties || {}),
    };
  }
}
