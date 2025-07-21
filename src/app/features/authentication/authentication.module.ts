import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthenticationRoutes } from './authentication.routing';

@NgModule({
  imports: [RouterModule.forChild(AuthenticationRoutes)],
})
export class AuthenticationModule {}
