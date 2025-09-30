import { Component, OnInit } from '@angular/core';
import { AuthService } from './features/authentication/authService.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {

  loading: boolean = false;
  title = 'main16';

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    // Si quieres mostrar loading al iniciar sesión, puedes hacerlo en el login, no aquí.
    // Aquí puedes verificar si el usuario está autenticado:
    this.loading = !this.auth.isAuthenticated();
  }

}