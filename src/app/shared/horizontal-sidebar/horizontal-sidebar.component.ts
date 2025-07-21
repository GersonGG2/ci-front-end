import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { RouteInfo } from './horizontal-sidebar.metadata';
import { HorizontalSidebarService } from './horizontal-sidebar.service';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HasPermissionDirective } from 'src/app/helpers/has-permission.directive';

@Component({
  selector: 'app-horizontal-sidebar',
  imports: [TranslateModule, RouterModule, FeatherModule, CommonModule, HasPermissionDirective],
  templateUrl: './horizontal-sidebar.component.html'
})
export class HorizontalSidebarComponent {
  showMenu = '';
  showSubMenu = '';
  public sidebarnavItems: RouteInfo[] = [];
  path = '';

  constructor(
    private menuServise: HorizontalSidebarService,
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

    // Suscríbete al evento de navegación para realizar el desplazamiento
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      });
  }

  addExpandClass(element: any) {
    if (element === this.showMenu) {
      this.showMenu = element;
    } else {
      this.showMenu = element;
    }
  }

  addActiveClass(element: any) {
    if (element === this.showSubMenu) {
      this.showSubMenu = element;
    } else {
      this.showSubMenu = element;
    }
    /*window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });*/
  }
}
