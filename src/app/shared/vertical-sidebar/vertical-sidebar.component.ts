import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RouteInfo } from './vertical-sidebar.metadata';
import { VerticalSidebarService } from './vertical-sidebar.service';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
    selector: 'app-vertical-sidebar',
    imports: [
        TranslateModule,
        RouterModule,
        FeatherModule,
        CommonModule,
        NgScrollbarModule,
    ],
    templateUrl: './vertical-sidebar.component.html'
})
export class VerticalSidebarComponent {
  showMenu = '';
  showSubMenu = '';
  public sidebarnavItems: RouteInfo[] = [];
  path = '';

  @Input() showClass: boolean = false;
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();

  handleNotify() {
    this.notify.emit(!this.showClass);
  }

  constructor(
    private menuServise: VerticalSidebarService,
    private router: Router
  ) {
    this.menuServise.items.subscribe((menuItems) => {
      this.sidebarnavItems = menuItems;

      // Active menu
      this.sidebarnavItems.filter((m) =>
        m.submenu.filter((s) => {
          if (s.path === this.router.url) {
            this.path = m.title;
          }
        })
      );
      this.addExpandClass(this.path);
    });
  }

  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  addActiveClass(element: any) {
    if (element === this.showSubMenu) {
      this.showSubMenu = '0';
    } else {
      this.showSubMenu = element;
    }
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }
}
