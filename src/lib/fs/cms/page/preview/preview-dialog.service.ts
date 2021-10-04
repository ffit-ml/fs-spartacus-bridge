import { Observable, combineLatest, of, isObservable } from 'rxjs';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { TppWrapperService } from '../tpp-wrapper-service';

@Injectable({
  providedIn: 'root',
})
export class PreviewDialogService {
  constructor(private tppWrapperService: TppWrapperService) {}

  showErrorDialog(title$: Observable<string>, message$: Observable<string>): void {
    const title$$ = isObservable(title$) ? title$ : of('');
    const message$$ = isObservable(message$) ? message$ : of('');
    combineLatest([title$$, message$$])
      .pipe(take(1))
      .subscribe(async (errorDialogData) => {
        await this.tppWrapperService.showErrorMessageDialog(...errorDialogData);
      });
  }

  showDetailedErrorDialog(title$: Observable<string>, message$: Observable<string>, detailedMessage$?: Observable<string>): void {
    const title$$ = isObservable(title$) ? title$ : of('');
    const message$$ = isObservable(message$) ? message$ : of('');
    const detailedMessage$$ = isObservable(detailedMessage$) ? detailedMessage$ : of('');
    combineLatest([title$$, message$$, detailedMessage$$])
      .pipe(take(1))
      .subscribe(async (errorDialogData) => {
        await this.tppWrapperService.showErrorMessageDialog(...errorDialogData);
      });
  }
}
