declare module 'fs-tpp-api/snap' {
  export interface CreateSectionOptions {
    body?: string;
    template?: string;
    name?: string;
    index?: number;
    result?: boolean;
  }

  export interface CreatePageOptions {
    language?: string;
    result?: boolean;
    showFormDialog?: boolean;
    forceUid?: boolean;
  }

  export interface Status {
    storeType?: string;
    uidType?: string;
    elementType?: string;
    id?: string;
    displayName?: string;
    uid?: string;
    released?: boolean;
    releaseSupported: boolean;
    bookmark: boolean;
    workflows?: any;
    language?: string;
    entityId?: string;
    name: string;
    permissions: {
      see: boolean;
      read: boolean;
      change: boolean;
      delete: boolean;
      appendLeaf: boolean;
      deleteLeaf: boolean;
      release: boolean;
      seeMeta: boolean;
      changeMeta: boolean;
      changePermission: boolean;
    };
    children: any[];
    custom: any;
  }

  export interface CreatePageResult extends CreateSectionResult {
    uid: string;
    displayname?: string;
    locale: {
      identifier: string;
      country: string;
      language: string;
    };
  }

  export interface CreateSectionResult {
    identifier: string;
    template:
      | string
      | {
          fsType: string;
          identifier: string;
          name: string;
          uid: string;
          uidType?: string;
        };
    formData: { [key: string]: any };
    previewId?: string;
    name: string;
    fsType: string;
  }

  interface SNAP {
    isConnected: Promise<boolean>;
    createSection(previewId: string, options?: CreateSectionOptions): Promise<CreateSectionResult> | void;
    createPage(path: string, uid: string, template: string, options?: CreatePageOptions): Promise<CreatePageResult> | void;
    getPreviewElement(): Promise<string>;
    onContentChange(handler: ($node: HTMLElement, previewId: string, content: any) => any);
    onInit(handler: (success: boolean) => void);
    onRerenderView(handler: () => void);
    onRequestPreviewElement(handler: (previewId: string) => void);
    renderElement(previewId: string): Promise<string | object>;
    setPreviewElement(previewId: string);
    getElementStatus(previewId: string): Promise<Status>;
    triggerRerenderView(): Promise<void>;
    execute(identifier: string, params?: object, result?: boolean): Promise<any>;
    showEditDialog(previewId: string);
    overrideDefaultButton(defaultButtonName: string, buttonOverrides: Button | null): void;
  }

  export interface Button {
    getItems(scope: ButtonScope): any[];
    execute(scope: ButtonScope, item: any): Promise<void>;
  }

  export interface ButtonScope {
    $node: HTMLElement;
    $button: HTMLElement;
    previewId: string;
    status: Status;
    language: string;
  }

  const TPP_SNAP: SNAP;
  export default TPP_SNAP;
}