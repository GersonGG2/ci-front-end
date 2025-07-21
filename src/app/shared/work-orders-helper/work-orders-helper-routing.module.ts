import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrdersHelperComponent } from './work-orders-helper.component';
import { WorkOrdersDetailComponent } from './work-orders-detail/work-orders-detail.component';

const routes: Routes = [
  {
    path: '',
    component: WorkOrdersHelperComponent,
    data: {
      title: 'Órdenes de Trabajo'
    },
    children: [
      {
        path: ':rcvHeaderId/:odtHeaderId',
        component: WorkOrdersDetailComponent,
        data: {
          title: 'Detalle de Recibo',
          urls: [
            { title: 'Inicio', url: '/' },
            { title: 'Recibos', url: '/receipts' },
            { title: 'Detalle' }
          ]
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrdersHelperRoutingModule {}
