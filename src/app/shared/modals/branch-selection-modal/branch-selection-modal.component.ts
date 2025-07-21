import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { WorkOrderService } from '../workOrderService.service';

@Component({
  selector: 'app-branch-selection-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-selection-modal.component.html',
  styleUrl: './branch-selection-modal.component.scss',
  providers: [WorkOrderService]
})
export class BranchSelectionModalComponent {
  @ViewChild('content', { static: true }) content: any;
  modalRef: NgbModalRef;
  @Output() reloadEvent = new EventEmitter<any>();

  constructor(private modalService: NgbModal, private fb: FormBuilder, private workOrderService: WorkOrderService, private toastr: ToastrService) {}

  headerId: string = '';
  selectedBranchId: number | null = null;
  branches: any[] = [];

  async openBranchSelectionModal(data: any) {
    this.headerId = data.header.headerId;
    this.selectedBranchId = data.header.branchId;
    this.branches = data.branchList;

    this.modalRef = this.modalService.open(this.content, { ariaLabelledBy: 'modal-branch-title' });
  }

  async updateBranch() {
    if (!this.selectedBranchId) {
      this.toastr.warning('Por favor complete todos los campos requeridos.', 'Advertencia');
      return;
    }
    const response = await this.workOrderService.updateBranch(Number(this.headerId), Number(this.selectedBranchId));
    if (response.status == 200) {
      this.toastr.success('La sucursal ha sido actualizada correctamente.', 'Éxito');
      this.reloadEvent.emit();
      this.modalRef.close();
    } else {
      this.toastr.error(response.message, 'Error');
    }
  }
}
