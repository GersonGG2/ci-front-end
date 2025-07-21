import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    imports: [RouterModule, CommonModule],
    templateUrl: './login.component.html'
})
export class LoginComponent {
  constructor() {}

  loginform = true;
  recoverform = false;

  showRecoverForm() {
    this.loginform = !this.loginform;
    this.recoverform = !this.recoverform;
  }
}
