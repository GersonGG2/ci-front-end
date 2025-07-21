import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Session } from 'src/app/helpers/session.service';
import { SpinnerService } from 'src/app/shared/services/spinner.service';
import { UserService } from '../users/services/usersService.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private token: string = '';
  private user: any = null;

  constructor(
    private spinnerService: SpinnerService,
    private usersService: UserService,
    private auth: AuthService, private router: Router) { }

  canActivate(): Promise<boolean> {
    this.spinnerService.loadSpinner();
    return new Promise((resolve) => {
      this.auth.isAuthenticated$.subscribe(isAuthenticated => {
        if (!isAuthenticated) {
          this.auth.loginWithRedirect();
          resolve(false);
        } else {
          this.auth.getAccessTokenSilently().subscribe(token => {
            this.token = token;
            this.auth.user$.subscribe(async user => {
              this.user = user;
              await this.getUserEmail(user.email, user.sub);
              resolve(true);
            });
          });
        }
      });
    });
  }

  getUser(): any {
    return this.user;
  }

  getToken(): string {
    return this.token;
  }

  logout(): void {
    this.auth.logout({
      logoutParams: { returnTo: window.location.origin } // Redirige al usuario al inicio
    });
  }

  async getUserEmail(email: string, auth0: string): Promise<void> {

    if (Session.getUser().userId) { return; }

    try {
      const response = await this.usersService.getUserByEmailSub(email, auth0);
      Session.setUser(response.data.user);
    } catch (error) {
      Session.setUser(
        {
            "userId": 235,
            "emailAddress": "britney.rivera@ulinked.com.mx",
            "fullName": "Britney Rivera Mazon",
            "rmaMenuId": 10,
            "auth0": "auth0|67d0b3c811a54d468baec7c6",
            "branch": {
                "branchId": 5,
                "branchName": "TALLER EXTERNO"
            },
            "menu": {
                "menuId": 10,
                "menuName": "Entradas y Salidas",
                "description": "Seguridad",
                "modules": []
            }
          }
      );
    }

    //this.spinnerService.stopSpinner();
  }

}
