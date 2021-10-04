import TPP_SNAP, { CreateSectionOptions, CreatePageOptions, CreatePageResult, CreateSectionResult, Status } from 'fs-tpp-api/snap';
import { Injectable } from '@angular/core';
import { FsCmsPageInterface } from './fs-cms-page.interface';

export interface PageTypeMappingResult {
  fsTemplate: string;
  supportsContentPageEnrichment: string;
  pageFolder: string;
}

@Injectable({
  providedIn: 'root',
})
export class TppWrapperService {
  constructor() {}

  async getFsPageTypeMapping(pageType: string, pageTemplate: string): Promise<PageTypeMappingResult | undefined> {
    console.log(`Execute the script 'page_type_mapping' with the parameters pageType = '${pageType}' and pageTemplate = '${pageTemplate}'`);
    const result = (await this.execute('script:page_type_mapping', { pageType, pageTemplate })) as PageTypeMappingResult;
    console.log(`The result of the execution of the script 'page_type_mapping' is: '${JSON.stringify(result)}'`);
    return result;
  }

  async showErrorMessageDialog(title: string, message: string, detailedMessage?: string): Promise<void> {
    console.error(`showErrorMessageDialog(): ${title}: ${message}`, detailedMessage);
    return await this.execute('script:show_message_dialog', { message, title, detailedMessage });
  }

  async setPreviewElement(previewId: string): Promise<void> {
    await TPP_SNAP.setPreviewElement(previewId || null); // It is important to pass null (instead of undefined), if there is no preview id!
  }

  async getHybrisPageId(pageRefUid: string): Promise<string> {
    const getPageIdParameters = { pageRefUid };
    console.log(
      `Calling the script 'ContentConnectSAPCommerceCloud_GetHybrisPageId' with the following parameters: ${JSON.stringify(
        getPageIdParameters
      )}`
    );
    return this.execute('class:ContentConnectSAPCommerceCloud_GetHybrisPageId', getPageIdParameters);
  }

  async setHybrisPageId(pageRefUid: string, hybrisPageId: string): Promise<string | null> {
    const pageDataParameters = { pageRefUid, hybrisPageId, syncWithCmsPage: false };
    console.log(
      `Calling the script 'ContentConnectSAPCommerceCloud_FSContentPageDataEnrichment' with the following parameters: ${JSON.stringify(
        pageDataParameters
      )}`
    );
    return this.execute('class:ContentConnectSAPCommerceCloud_FSContentPageDataEnrichment', pageDataParameters);
  }

  async getElementStatus(previewId: string): Promise<Status> {
    return TPP_SNAP.getElementStatus(previewId);
  }

  async getPreviewElement(): Promise<string> {
    return TPP_SNAP.getPreviewElement();
  }

  createSection(previewId: string, options?: CreateSectionOptions): Promise<CreateSectionResult> | void {
    return TPP_SNAP.createSection(previewId, options);
  }

  createPage(path: string, uid: string, template: string, options?: CreatePageOptions): Promise<CreatePageResult> | void {
    return TPP_SNAP.createPage(path, uid, template, options);
  }

  onRerenderView(handler: () => void): void {
    TPP_SNAP.onRerenderView(handler);
  }

  onRequestPreviewElement(handler: (previewId: string) => void): void {
    TPP_SNAP.onRequestPreviewElement(handler);
  }

  async triggerRerenderView(): Promise<void> {
    return TPP_SNAP.triggerRerenderView();
  }

  async renderElement(previewId: string): Promise<FsCmsPageInterface> {
    return TPP_SNAP.renderElement(previewId) as Promise<FsCmsPageInterface>;
  }

  async execute(identifier: string, params: object, result?: boolean): Promise<any> {
    return TPP_SNAP.execute(identifier, params, result);
  }
  showEditDialog(previewId: string) {
    return TPP_SNAP.showEditDialog(previewId);
  }
}
