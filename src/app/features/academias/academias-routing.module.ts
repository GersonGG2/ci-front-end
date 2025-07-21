
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AcademiasComponent } from './academias/academias.component';

const routes: Routes = [
  {
    path: '',
    component: AcademiasComponent,
    data: {
      title: 'Academias',
      urls: [
        { title: 'Academias', url: '/dashboard' },
        { title: 'Academias' }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademiasRoutingModule { }
