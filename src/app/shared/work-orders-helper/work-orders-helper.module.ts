import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkOrdersHelperRoutingModule } from './work-orders-helper-routing.module';

import { WorkOrdersHelperComponent } from './work-orders-helper.component';

@NgModule({
  declarations: [WorkOrdersHelperComponent],
  imports: [CommonModule, WorkOrdersHelperRoutingModule],
  bootstrap: [WorkOrdersHelperComponent]
})
export class WorkOrdersHelperModule {}
