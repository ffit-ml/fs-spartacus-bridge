import { ContentSlotData } from '@spartacus/core';
import { InjectionToken, Injectable } from '@angular/core';
import { MergeStrategy } from 'fs-spartacus-common';

export const REPLACE = new InjectionToken<MergeStrategy<ContentSlotData>>('ReplaceMergeStrategy');

@Injectable()
export class Replace implements MergeStrategy<ContentSlotData> {
  merge(occContentSlot: ContentSlotData, fsContentSlot: ContentSlotData): ContentSlotData {
    return fsContentSlot;
  }
}
