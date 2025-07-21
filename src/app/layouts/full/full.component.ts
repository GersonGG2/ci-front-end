import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbCollapseModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { HorizontalNavigationComponent } from 'src/app/shared/horizontal-header/horizontal-navigation.component';
import { HorizontalSidebarComponent } from 'src/app/shared/horizontal-sidebar/horizontal-sidebar.component';
import { VerticalNavigationComponent } from 'src/app/shared/vertical-header/vertical-navigation.component';
import { VerticalSidebarComponent } from 'src/app/shared/vertical-sidebar/vertical-sidebar.component';

@Component({
  selector: 'app-full-layout',
  imports: [
    NgScrollbarModule,
    NgbNavModule,
    RouterModule,
    CommonModule,
    FormsModule,
    HorizontalSidebarComponent,
    BreadcrumbComponent,
    HorizontalNavigationComponent,
    VerticalSidebarComponent,
    VerticalNavigationComponent,
    NgbCollapseModule
  ],
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent implements OnInit {
  @ViewChild('successTpl') successTpl: any;
  @ViewChild('infoTpl') infoTpl: any;
  @ViewChild('warningTpl') warningTpl: any;
  @ViewChild('dangerTpl') dangerTpl: any;

  active = 1;

  constructor(public router: Router) {}

  tabStatus = 'justified';

  public isCollapsed = false;

  public innerWidth: any;
  public defaultSidebar: any;
  public showSettings = false;
  public showMobileMenu = false;
  public expandLogo = false;

  options = {
    theme: 'light', // two possible values: light, dark
    dir: 'ltr', // two possible values: ltr, rtl
    layout: 'horizontal', // two possible values: vertical, horizontal
    sidebartype: 'full', // four possible values: full, iconbar, overlay, mini-sidebar
    sidebarpos: 'fixed', // two possible values: fixed, absolute
    headerpos: 'fixed', // two possible values: fixed, absolute
    boxed: 'boxed', // two possible values: full, boxed
    navbarbg: 'skin6', // six possible values: skin(1/2/3/4/5/6)
    sidebarbg: 'skin5', // six possible values: skin(1/2/3/4/5/6)
    logobg: 'skin5' // six possible values: skin(1/2/3/4/5/6)
  };

  Logo() {
    this.expandLogo = !this.expandLogo;
  }

  ngOnInit() {
    if (this.router.url === '/') {
      this.router.navigate(['/dashboard/dashboard1']);
    }
    this.defaultSidebar = this.options.sidebartype;
    this.handleSidebar();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: string) {
    this.handleSidebar();
  }

  handleSidebar() {
    this.innerWidth = window.innerWidth;
    switch (this.defaultSidebar) {
      case 'full':
      case 'iconbar':
        if (this.innerWidth < 1170) {
          this.options.sidebartype = 'mini-sidebar';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      case 'overlay':
        if (this.innerWidth < 767) {
          this.options.sidebartype = 'mini-sidebar';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      default:
    }
  }

  toggleSidebarType() {
    switch (this.options.sidebartype) {
      case 'full':
      case 'iconbar':
        this.options.sidebartype = 'mini-sidebar';
        break;

      case 'overlay':
        this.showMobileMenu = !this.showMobileMenu;
        break;

      case 'mini-sidebar':
        if (this.defaultSidebar === 'mini-sidebar') {
          this.options.sidebartype = 'full';
        } else {
          this.options.sidebartype = this.defaultSidebar;
        }
        break;

      default:
    }
  }

  handleClick(event: boolean) {
    this.showMobileMenu = event;
  }
}
