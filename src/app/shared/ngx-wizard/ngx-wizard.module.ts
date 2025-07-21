import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';

import { NGXWizardRoutingModule } from './ngx-wizard-routing.module';
import { NGXFormWizardComponent } from './ngx-wizard.component';

import { NavbarComponent } from './navbar/navbar.component';

import { WorkflowService } from './workflow/workflow.service';
import { FormDataService } from './data/formData.service';

@NgModule({
  imports: [CommonModule, FormsModule, NGXWizardRoutingModule, FeatherModule],
  declarations: [NGXFormWizardComponent, NavbarComponent],
  providers: [
    { provide: FormDataService, useClass: FormDataService },
    { provide: WorkflowService, useClass: WorkflowService }
  ],
  bootstrap: [NGXFormWizardComponent]
})
export class NGXFormWizardModule {}
