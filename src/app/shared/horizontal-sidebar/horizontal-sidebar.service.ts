import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RouteInfo } from './horizontal-sidebar.metadata';
import { ROUTES } from './horizontal-menu-items';
import { Session } from 'src/app/helpers/session.service';


@Injectable({
    providedIn: 'root'
})
export class HorizontalSidebarService {

    public screenWidth: any;
    public collapseSidebar: boolean = false;
    public fullScreen: boolean = false;

    MENUITEMS: RouteInfo[] = [];

    items = new BehaviorSubject<RouteInfo[]>(this.MENUITEMS);

    constructor() {

        const user = Session.getUser()

        if (true) {
            this.items.next(ROUTES);
        } else {
            console.log('User:', user);
            console.log('Menu items:', this.MENUITEMS);
        }


    }

}
