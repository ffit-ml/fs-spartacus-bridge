import { ContentSlotData } from '@spartacus/core';
import { InjectionToken, Injectable } from '@angular/core';
import { merge } from 'immutable';
import { MergeStrategy } from 'fs-spartacus-common';

export const APPEND = new InjectionToken<MergeStrategy<ContentSlotData>>('AppendMergeStrategy');

@Injectable()
export class Append implements MergeStrategy<ContentSlotData> {
  merge(aContentSlot: ContentSlotData, anotherContentSlot: ContentSlotData): ContentSlotData {
    return {
      components: merge(aContentSlot.components || [], anotherContentSlot.components || []),
      properties: merge(aContentSlot.properties || {}, anotherContentSlot.properties || {}),
    };
  }
}
