import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HiddenNumberStateService {
  private selectedTabSubject = new BehaviorSubject<string | null>(null);
  selectedTab$ = this.selectedTabSubject.asObservable();

  setSelectedTab(tab: string | null): void {
    this.selectedTabSubject.next(tab);
  }

  getSelectedTab(): string | null {
    return this.selectedTabSubject.getValue();
  }
}
