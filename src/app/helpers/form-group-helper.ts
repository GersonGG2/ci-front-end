import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";

export class FormGroupHelper {

    static createFormControls = (arrayData: any[], dataSet?: any): any => {
        const controls = {};
        arrayData.forEach(d => {
            let value = d?.defaultValue || null;
            if(!!dataSet && !!dataSet[d.name] && !!dataSet[d.name]?.value) {
                value = dataSet[d.name].value;
            }
            controls[d.name] = new FormControl(value, d.validators);
        });
        return controls;
    }

    static clearAndUpdateValidity = (formControl: AbstractControl) => {
        formControl.clearValidators();
        formControl.updateValueAndValidity();
    }

    static addAndUpdateValidity = (formControl: AbstractControl, validators: ValidatorFn | ValidatorFn[]) => {
        formControl.addValidators(validators);
        formControl.updateValueAndValidity();
    }
}