import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SignupComponent } from './signup/signup.component';
import { LockComponent } from './lock/lock.component';
import { AuthenticationRoutes } from './authentication.routing';
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(AuthenticationRoutes),
    SignupComponent,    // <-- standalone
    LoginComponent,     // <-- standalone
    LockComponent       // <-- standalone
  ],
  declarations: [
    // Solo componentes NO standalone
  ]
})
export class AuthenticationModule {}