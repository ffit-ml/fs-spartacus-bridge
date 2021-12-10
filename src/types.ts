import { Observable } from 'rxjs'

export interface MapLike<ValueType> {
  [key: string]: ValueType;
}

export interface CountryProvider {
  getActive(): Observable<string>;
}
