import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Approutes } from './app-routes';

@NgModule({
  imports: [RouterModule.forRoot(Approutes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
