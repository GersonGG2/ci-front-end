import { Component } from '@angular/core';
import { Router, ActivatedRoute, } from "@angular/router";
import { Session } from 'src/app/helpers/session.service';


@Component({
    selector: 'msw-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: false
})

export class NavbarComponent {
    constructor(private router: Router,
        private route: ActivatedRoute) {
    }
    page: string = "Inspection information";
    id: string = "";
    isViewInsp: boolean = false;

    ngOnInit() {
        this.router.events
            //.filter(event => event instanceof NavigationEnd)
            .subscribe(event => {
                let currentRoute = this.route.root;
                while (currentRoute.children[0] !== undefined) {
                    currentRoute = currentRoute.children[0];
                }
                
                const urls = currentRoute.snapshot.data["urls"];
                this.page = (Array.isArray(urls) && urls[2] && urls[2]['title']) ? urls[2]['title'] : '';
            })

        const url = this.router.url.split("/");

        this.id = url[url.length - 1];
        this.isViewInsp = Session.isViewInsp(this.id);
    }

    pages = ['Información', 'Inspección', 'Hoja de Inspección', 'Finalizar']; // Lista de páginas
    names = ['INFORMACIÓN', 'INSPECCIÓN', 'HOJA DE INSPECCIÓN', 'FINALIZAR']; // Lista de nombres

    getPreviousPage(): string {
        const currentIndex = this.pages.indexOf(this.page);
        return currentIndex > 0 ? this.pages[currentIndex - 1] : '';
    }

    getName(index: number): string {
        return this.names[index].toUpperCase();
    }


}