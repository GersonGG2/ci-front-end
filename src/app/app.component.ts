import { Component } from '@angular/core';
import { AuthGuard } from './features/auth0/auth.guard';
import { AuthService } from '@auth0/auth0-angular';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {

  loading: boolean = true;

  title = 'main16';

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    // Detecta si Auth0 está cargando
    this.auth.isLoading$.subscribe((isLoading) => {
      this.loading = isLoading;
    });
  }

}
