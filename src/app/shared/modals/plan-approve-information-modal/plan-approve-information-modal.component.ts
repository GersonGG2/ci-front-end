import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderService } from '../workOrderService.service';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-plan-approve-information-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectComponent, NgOptionComponent],
  templateUrl: './plan-approve-information-modal.component.html',
  styleUrl: './plan-approve-information-modal.component.scss',
  providers: [WorkOrderService]
})
export class PlanApproveInformationModalComponent {
  @ViewChild('content', { static: true }) content: any;
  modalRef: NgbModalRef;
  @Output() reloadEvent = new EventEmitter<any>();

  record = null;
  isAdditional = false;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private workOrderService: WorkOrderService, private toastr: ToastrService) {}

  async openPlanApproveInformationModal(data: any) {
    this.record = data.record;
    this.isAdditional = data.isAdditional;

    this.modalRef = this.modalService.open(this.content, { ariaLabelledBy: 'modal-plan-approve-information-title', size: 'xl' });
  }
}
