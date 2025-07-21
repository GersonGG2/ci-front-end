import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from './usuario/usuarios.component';

const routes: Routes = [
  {
    path: '',
    component: UsuariosComponent,
    data: {
      title: 'Usuarios',
      urls: [
        { title: 'Usuarios', url: '/dashboard' },
        { title: 'Usuarios' }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule { }
