import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsComponent } from './pages/main-page/notifications.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
    data: {
      title: 'Notificaciones',
      urls: [
        { title: 'Inicio', url: '/' },
        { title: 'Notificaciones' }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule { }