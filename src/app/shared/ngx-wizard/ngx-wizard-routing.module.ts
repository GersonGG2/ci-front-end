import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NGXFormWizardComponent } from './ngx-wizard.component';

import { InformationComponent } from './steps/information/information.component';
import { UnitInspectionComponent } from './steps/inspection/unit-inspection/unit-inspection.component';
import { TireInspectionComponent } from './steps/inspection/tire-inspection/tire-inspection.component';
import { InspectionSheetComponent } from './steps/inspection-sheet/inspection-sheet.component';
import { FinishComponent } from './steps/finish/finish.component';
import { url } from 'inspector';

const routes: Routes = [
  {
    path: '',
    component: NGXFormWizardComponent,
    data: {
      title: 'Inspecciones',
    },
    children: [
      {
        path: 'information/:id',
        component: InformationComponent,
        data: {
          title: 'Inspección',
          urls: [
            { title: 'Inicio', url: '/' },
            { title: 'Inspecciones', url: '/incoming-inspections' },
            { title: 'Información' },
            { title: '{1}' }
          ]
        }
      },
      {
        path: 'unit-inspection/:id',
        component: UnitInspectionComponent,
        data: {
          title: 'Inspección',
          urls: [
            { title: 'Inicio', url: '/' },
            { title: 'Inspecciones', url: '/incoming-inspections' },
            { title: 'Inspección' },
            { title: '{1}' }
          ]
        }
      },
      {
        path: 'tire-inspection/:id',
        component: TireInspectionComponent,
        data: {
          title: 'Inspección',
          urls: [
            { title: 'Inicio', url: '/' },
            { title: 'Inspecciones', url: '/incoming-inspections' },
            { title: 'Inspección' },
            { title: '{1}' }
          ]
        }
      },
      {
        path: 'inspection-sheet/:id',
        component: InspectionSheetComponent,
        data: {
          title: 'Inspección',
          urls: [
            { title: 'Inicio', url: '/' },
            { title: 'Inspecciones', url: '/incoming-inspections' },
            { title: 'Hoja de Inspección' },
            { title: '{1}' }
          ]
        }
      },
      {
        path: 'finish/:id',
        component: FinishComponent,
        data: {
          title: 'Inspección',
          urls: [
            { title: 'Inicio', url: '/' },
            { title: 'Inspecciones', url: '/incoming-inspections' },
            { title: 'Finalizar' },
            { title: '{1}' }
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
export class NGXWizardRoutingModule {}
