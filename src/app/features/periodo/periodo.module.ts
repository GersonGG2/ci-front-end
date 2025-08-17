import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeriodoRoutingModule } from './periodo-routing.module';
import { VerPeriodoComponent } from './ver-periodo/ver-periodo.component';
import { PeriodosService } from './periodo.service';
import { PeriodoComponent } from './periodo/periodo.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PeriodoRoutingModule,
    PeriodoComponent
  ],
})
export class PeriodoModule { }
