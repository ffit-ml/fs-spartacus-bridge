import { PageContext } from '@spartacus/core';

function extractCmsPageUid(occUidOrLabel: string): string | null | undefined {
  return occUidOrLabel != null && occUidOrLabel.startsWith('/') ? occUidOrLabel.substring(1) : occUidOrLabel;
}

function getPageId(pageContext: PageContext): string | null | undefined {
  if (isNaN(pageContext.id as any)) {
    return extractCmsPageUid(pageContext.id);
  }
  if (pageContext.type != null && pageContext.type.length > 0) {
    return `${extractCmsPageUid(pageContext.type)}_${extractCmsPageUid(pageContext.id)}`;
  }
  return extractCmsPageUid(pageContext.id);
}

export function extractPageUniqueId(
  pageContext: PageContext
): { pageId: string | null | undefined; firstSpiritPageId: string | null | undefined } {
  const pageIdString = getPageId(pageContext);
  const firstSpiritPageIdString = pageIdString ? pageIdString.replace(/-/g, '_') : pageIdString;
  return { pageId: pageIdString, firstSpiritPageId: firstSpiritPageIdString };
}
