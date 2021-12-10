import { HttpClient } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CaasAccessData } from './caas-access-data';

export class CaasClient {
  private collectionUrl: string;

  constructor(private caasCollection: CaasAccessData, private httpClient: HttpClient) {
    this.collectionUrl = caasCollection.collectionUrl();
  }

  getByUid(name: string, language: string, altName?: string, country?: string) {
    altName = typeof altName === 'string' && altName.trim().length > 0 ? altName : undefined;
    return this.httpClient
      .get(this.collectionUrl, {
        headers: {
          Authorization: `apikey="${this.caasCollection.apiKey}"`,
        },
        params: {
          filter: `{'$or':[
                      {'$and':[
                        {'$or':[
                          {'uid':'${name}'},
                          {'uid':'${name?.toLocaleLowerCase()}'}
                        ]},
                        {'locale.language':'${language}'},
                        ${country?.length === 2 ? '{\'locale.country\': \'' + country + '\'}' : ''}
                      ]},
                      {'page.formData.pt_seoUrl.value':'${altName || name}'},
                      {'page.formData.pt_seoUrl.value':'${altName || name?.toLocaleLowerCase()}'}
                    ]}`,
        },
      })
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            return EMPTY;
          }
        })
      );
  }

  getPageSections(name: string, language: string, country: string, altName?: string) {
    altName = typeof altName === 'string' && altName.trim().length > 0 ? altName : undefined;
    return this.httpClient
      .get(this.collectionUrl, {
        headers: {
          Authorization: `apikey="${this.caasCollection.apiKey}"`,
        },
        params: {
          filter: `{'$or':[
                      {'$and':[
                          {'$or':[
                              {'uid':'${name}'},
                              {'uid':'${name?.toLocaleLowerCase()}'}
                            ]},
                          {'locale.language':'${language}'},
                          {'locale.country': '${country}'}
                        ]},
                      {'page.formData.pt_seoUrl.value':'${altName || name}'},
                      {'page.formData.pt_seoUrl.value':'${altName || name?.toLocaleLowerCase()}'}
                    ]}`,
          rep: 's',
          keys: `{'page.children.children':1}`,
        },
      })
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            return EMPTY;
          }
        })
      );
  }

  /**
   * Gets CaaS items by the '_id' attribute, NOT the 'identifier' attribute.
   */
  getByIds(ids: string[]) {
    return this.httpClient
      .get(this.collectionUrl, {
        headers: {
          Authorization: `apikey="${this.caasCollection.apiKey}"`,
        },
        params: {
          filter: `{'_id':{'$in':[${ids?.join(',')}]}}`,
        },
      })
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            return EMPTY;
          }
        })
      );
  }
}
