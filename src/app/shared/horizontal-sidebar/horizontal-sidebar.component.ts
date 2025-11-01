import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { RouteInfo } from './horizontal-sidebar.metadata';
import { HorizontalSidebarService } from './horizontal-sidebar.service';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HasPermissionDirective } from 'src/app/helpers/has-permission.directive';
import { ROUTES } from './horizontal-menu-items';

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
    const userString = localStorage.getItem('user');
    let hasAdminRole = false;
    let hasDocenteRole = false;
    let hasInstructorRole = false;
    let hasJefeRole = false;

    if (userString) {
      try {
        const user = JSON.parse(userString);

        // Verificar los roles directamente del array de roles
        if (user.roles && Array.isArray(user.roles)) {
          hasAdminRole = user.roles.some(role => role.nombre === 'Admin');
          hasDocenteRole = user.roles.some(role => role.nombre === 'Docente');
          hasInstructorRole = user.roles.some(role => role.nombre === 'Instructor');
          hasJefeRole = user.roles.some(role => role.nombre === 'Jefe de academia');
        }
      } catch (error) {
        console.error('Error al parsear el usuario:', error);
      }
    }

    // Filtrar los menús según los roles encontrados
    if (hasAdminRole) {
      // Admin ve todos los menús
      this.sidebarnavItems = ROUTES;
    } else if (hasDocenteRole || hasInstructorRole || hasJefeRole) {
      // Otros roles solo ven menú de Periodo
      this.sidebarnavItems = ROUTES.filter(r => r.path === '/periodo' || r.path === '/cursos');
    } else {
      // Sin roles o sesión, mostrar solo periodo por defecto
      this.sidebarnavItems = ROUTES.filter(r => r.path === '/periodo' || r.path === '/cursos');
    }

    this.menuServise.items.subscribe((menuItems) => {

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
