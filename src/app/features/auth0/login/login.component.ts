import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { EnviromentHelper } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    this.authService.isAuthenticated$.subscribe(async (isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['dashboard']);
      } else {
        this.authService.loginWithRedirect({
          authorizationParams: { redirect_uri: EnviromentHelper.AUTH_CALLBACK }
        });
      }
    });
  }
}
