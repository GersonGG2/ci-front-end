import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeriodoComponent } from './periodo/periodo.component';
import { VerPeriodoComponent } from './ver-periodo/ver-periodo.component';
import { VerCursoComponent } from './ver-curso/ver-curso.component';

const routes: Routes = [
  {
    path: '',
    component: PeriodoComponent,
    data: {
      title: 'Periodo',
      urls: [
        { title: 'Inicio', url: '/' },
        { title: 'Periodo' }
      ]
    }
  },
  {
    path: 'cursos/:id',
    component: VerPeriodoComponent,
    data: {
      title: 'Detalle de Periodo',
      urls: [
        { title: 'Inicio', url: '/' },
        { title: 'Periodo', url: '/periodo' },
        { title: 'Cursos' }
      ]
    }
  },

  {
    path: 'cursos/docentes/:id',
    component: VerCursoComponent,
    data: {
      title: 'Ver Curso',
      urls: [
        { title: 'Inicio', url: '/' },
        { title: 'Periodo', url: '/periodo' },
        { title: 'Cursos', url: '/periodo/cursos' },
        { title: 'Detalle' }
      ]
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeriodoRoutingModule { }
