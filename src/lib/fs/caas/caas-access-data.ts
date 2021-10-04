import { CaasCollection } from './caas-collection';

export class CaasAccessData {
  constructor(
    private baseUrl: string,
    private tenantId: string,
    private project: string,
    private collection: CaasCollection,
    readonly apiKey: string
  ) {}

  collectionUrl() {
    return `${this.baseUrl}/${this.tenantId}/${this.project}.${this.collection}`;
  }
}
