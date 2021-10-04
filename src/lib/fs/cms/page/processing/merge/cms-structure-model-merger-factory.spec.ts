import { CmsStructureModelMergerFactory } from './cms-structure-model-merger-factory';
import { FirstSpiritManagedPage } from 'fs-spartacus-common';
import { CmsStructureModelMerger } from './cms-structure-model-merger';

describe('CmsStructureModelMergerFactory', () => {
  const fsCmsPageMergerFactory = new CmsStructureModelMergerFactory(
    {
      caas: { baseUrl: '', project: '', apiKey: '', tenantId: '' },
      firstSpiritManagedPages: [FirstSpiritManagedPage.enhanceSapPages('myOccTemplate', [])],
    },
    null
  );

  it('returns undefined, if a page is not managed by FirstSpirit, ', () => {
    const fsCmsPageMerger = fsCmsPageMergerFactory.createFsCmsPageMerger('myOtherTemplate');
    expect(fsCmsPageMerger).toBeUndefined();
  });

  it('returns a merger, if a page is managed by FirstSpirit, ', () => {
    const fsCmsPageMerger = fsCmsPageMergerFactory.createFsCmsPageMerger('myOccTemplate');
    expect(fsCmsPageMerger).toBeDefined();
    expect(fsCmsPageMerger).toBeInstanceOf(CmsStructureModelMerger);
  });
});
