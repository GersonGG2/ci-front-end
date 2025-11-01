import { Component, inject, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  Data,
  RouterModule,
} from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../services/breadcrumb.service';

const paths = [
  'periodo/cursos/docentes',
  'periodo/cursos',
];

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, CommonModule],
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit {

  breadcrumbService = inject(BreadcrumbService);

  urlBack = '';
  showBack = false;
  pageInfo: Data = Object.create(null);

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private route: ActivatedRoute
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(map(() => this.activatedRoute))
      .pipe(
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .pipe(mergeMap((route) => route.data))
      .subscribe((event) => {
        this.titleService.setTitle("DY - " + event['title']);

        const params = this.getAllRouteParams();
        const id = params['id'] || '';
        const periodoId = params['periodoId'] || '';

        if (id || periodoId) {
          const urls = event['urls'] || [];
          urls.forEach((url) => {
            if (url.title && url.title.includes('{1}')) {
              url.title = id.toString();
            }
            if (url.url && url.url.includes('{periodoId}')) {
              url.url = url.url.replace('{periodoId}', periodoId);
            }
          });
        }


        this.pageInfo = event;
        this.urlBack = this.isShowBack();
        this.showBack = this.urlBack !== null;
      });
  }

  ngOnInit() {
    this.breadcrumbService.showModal.set(false);
  }

  isShowBack() {

    const current = this.router.url;
    for (let i = 0; i < paths.length; i++) {
      if (current.includes(paths[i])) {
        return paths[i].split('/')[0];
      }
    }
    this.breadcrumbService.setShowModal(false);
    return null;
  }

  async confirmGoBack() {
    this.breadcrumbService.verifyGoBack(this.urlBack);
  }

  getAllRouteParams(): { [key: string]: string } {
    let route = this.activatedRoute.root;
    let params: { [key: string]: string } = {};

    while (route.firstChild) {
      route = route.firstChild;
      params = { ...params, ...route.snapshot.params };
    }

    return params;
  }

}
