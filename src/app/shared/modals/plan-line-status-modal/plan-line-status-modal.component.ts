import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderService } from '../workOrderService.service';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { doGetListValue } from 'src/app/helpers/utils';

@Component({
  selector: 'app-plan-line-status-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectComponent, NgOptionComponent],
  templateUrl: './plan-line-status-modal.component.html',
  styleUrl: './plan-line-status-modal.component.scss',
  providers: [WorkOrderService]
})
export class PlanLineStatusModalComponent {
  @ViewChild('content', { static: true }) content: any;
  modalRef: NgbModalRef;
  @Output() reloadEvent = new EventEmitter<any>();

  record = null;

  failures: any[] = [];
  approvedMotives: any[] = [];
  lineStates: any[] = [];

  planLineStatusForm = this.fb.group({
    lineId: [null],
    lineStatus: [null, [Validators.required]],
    approvedQuantity: [null, [Validators.required]],
    failure: [null, [Validators.required]],
    approvedMotive: [null, [Validators.required]],
    comments: [null]
  });

  constructor(private modalService: NgbModal, private fb: FormBuilder, private workOrderService: WorkOrderService, private toastr: ToastrService) {}

  async openPlanLineStatusModal(data: any) {
    this.record = data.record;
    this.failures = data.failuresList;
    this.approvedMotives = data.approveMotiveList;
    this.lineStates = doGetListValue('odt_line_status');

    this.planLineStatusForm.patchValue({
      lineId: data.record.lineId,
      approvedQuantity: data.record.approvedQuantity,
      failure: data.record.faultType,
      lineStatus: data.record.lineStatus,
      comments: data.record.approveComments
    });

    this.modalRef = this.modalService.open(this.content, { ariaLabelledBy: 'modal-plan-line-status-title', size: 'xl' });
  }

  async doSaveData() {
    if (this.planLineStatusForm.invalid) {
      this.toastr.warning('Por favor complete todos los campos requeridos.', 'Advertencia');
      return;
    }
    let payload = {
      lineId: Number(this.planLineStatusForm.value.lineId),
      approvedQuantity: Number(this.planLineStatusForm.value.approvedQuantity),
      approveComments: this.planLineStatusForm.value.comments,
      lineStatus: this.planLineStatusForm.value.lineStatus,
      falla: this.planLineStatusForm.value.failure,
      approveMotive: this.planLineStatusForm.value.approvedMotive
    };

    const response = await this.workOrderService.patchStatusLine(payload);
    if (response.status == 200) {
      this.reloadEvent.emit();
      this.toastr.success('Guardado correcto de la información.', 'Éxito');
      this.modalRef.close();
    } else {
      this.toastr.error(response.error.message, 'Error');
    }
  }
}
