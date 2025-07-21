import { Injectable } from '@angular/core';

import { FormData, Personal, Address } from './formData.model';
import { STEPS } from '../workflow/workflow.model';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class FormDataService {

    private formData: FormData = new FormData();
    private isInformationFormValid: boolean = false;
    private isInspectionFormValid: boolean = false;
    private isInspectionSheetFormValid: boolean = false;

    constructor(private workflowService: WorkflowService) {
    }
    
    // Get Information Tab Data
    getInformation(): Personal {
        // Return the Information data
        var information: Personal = {
            firstName: this.formData.firstName,
            lastName: this.formData.lastName,
            email: this.formData.email
        };
        return information;
    }

    // Set Information Tab Data
    setInformation(data: Personal) {
        // Update the Information data only when the Information Form had been validated successfully
        this.isInformationFormValid = true;
        this.formData.firstName = data.firstName;
        this.formData.lastName = data.lastName;
        this.formData.email = data.email;
        // Validate Information Step in Workflow
        this.workflowService.validateStep(STEPS.information);
    }

    // Get Inspection Tab Data
    getInspection(): string {
        // Return the inspection type
        return this.formData.work;
    }

    // Set Inspection Tab Data
    setInspection(data: string) {
        // Update the inspection type only when the Inspection Form had been validated successfully
        this.isInspectionFormValid = true;
        this.formData.work = data;
        // Validate Inspection Step in Workflow
        this.workflowService.validateStep(STEPS.inspection);
    }

    // Get Inspection Sheet Tab Data
    getInspectionSheet(): Address {
        // Return the Inspection Sheet data
        var inspectionSheet: Address = {
            street: this.formData.street,
            city: this.formData.city,
            state: this.formData.state,
            zip: this.formData.zip
        };
        return inspectionSheet;
    }
    
    // Set Inspection Sheet Tab Data
    setInspectionSheet(data: Address) {
        // Update the Inspection Sheet data only when the Inspection Sheet Form had been validated successfully
        this.isInspectionSheetFormValid = true;
        this.formData.street = data.street;
        this.formData.city = data.city;
        this.formData.state = data.state;
        this.formData.zip = data.zip;
        // Validate Inspection Sheet Step in Workflow
        this.workflowService.validateStep(STEPS.inspectionSheet);
    }

    getFormData(): FormData {
        // Return the entire Form Data
        return this.formData;
    }

    resetFormData(): FormData {
        // Reset the workflow
        this.workflowService.resetSteps();
        // Return the form data after all this.* members had been reset
        this.formData.clear();
        this.isInformationFormValid = this.isInspectionFormValid = this.isInspectionSheetFormValid = false;
        return this.formData;
    }

    isFormValid() {
        // Return true if all forms had been validated successfully; otherwise, return false
        return this.isInformationFormValid &&
            this.isInspectionFormValid &&
            this.isInspectionSheetFormValid;
    }
}