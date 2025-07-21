
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursosComponent } from './cursos/cursos.component';
import { CursosRoutingModule } from './cursos-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CursosComponent,
    CursosRoutingModule
  ]
})
export class CursosModule { }

