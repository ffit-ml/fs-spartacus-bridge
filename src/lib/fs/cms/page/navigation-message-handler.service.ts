import { Injectable } from '@angular/core';
import { PreviewPageService } from './preview/preview-page.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationMessageHandlerService {
  constructor(private previewPageService: PreviewPageService) {}

  initialize(): void {
    window.addEventListener(
      'message',
      (event) => {
        this.handleNavigationMessage(event);
      },
      false
    );
  }

  destroy() {
    window.removeEventListener('message', this.handleNavigationMessage, false);
  }

  private handleNavigationMessage(event: MessageEvent) {
    if (typeof event?.data === 'string' && event.data.startsWith('navigate:')) {
      const hybrisPageId = event.data.substring(9);
      this.navigateToHybrisPage(hybrisPageId);
    }
  }

  private async navigateToHybrisPage(hybrisPageId: string): Promise<void> {
    if (typeof hybrisPageId === 'string' && hybrisPageId.trim().length > 0) {
      if ((await this.previewPageService.navigateTo(hybrisPageId)) !== true) {
        console.error(`Could not navigate to the element with hybrisPageId: ${hybrisPageId}`);
      }
    } else console.error(`Could not navigate to empty hybrisPageId`);
  }
}
