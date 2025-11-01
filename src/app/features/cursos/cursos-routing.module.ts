import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CursosComponent } from './cursos/cursos.component';
import { VerCursoComponent } from '../periodo/ver-curso/ver-curso.component';

const routes: Routes = [
  {
    path: '',
    component: CursosComponent,
    data: {
      title: 'Mis Cursos',
      urls: [
        { title: 'Inicio', url: '/' },
        { title: 'Mis Cursos' }
      ]
    }
  },
  {
    path: 'docentes/:id',
    component: VerCursoComponent,
    data: {
      title: 'Detalle de Curso',
      urls: [
        { title: 'Inicio', url: '/' },
        { title: 'Mis Cursos', url: '/cursos' },
        { title: 'Detalle' }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CursosRoutingModule { }