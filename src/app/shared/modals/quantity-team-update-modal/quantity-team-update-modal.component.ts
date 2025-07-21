import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderService } from '../workOrderService.service';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-quantity-team-update-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectComponent, NgOptionComponent],
  templateUrl: './quantity-team-update-modal.component.html',
  styleUrl: './quantity-team-update-modal.component.scss',
  providers: [WorkOrderService]
})
export class QuantityTeamUpdateModalComponent {
  @ViewChild('content', { static: true }) content: any;
  modalRef: NgbModalRef;
  @Output() reloadEvent = new EventEmitter<any>();

  headerId: string = '';
  lineId: string = '';

  teamList: any[] = [];

  quantityTeamForm = this.fb.group({
    team: [null],
    quantity: [null]
  });

  constructor(private modalService: NgbModal, private fb: FormBuilder, private workOrderService: WorkOrderService, private toastr: ToastrService) {}

  async openQuantityTeamUpdateModal(data: any) {
    this.quantityTeamForm.reset();

    this.headerId = data.row.headerId;
    this.lineId = data.row.lineId;
    const response = await this.workOrderService.getQuantityTeam(this.headerId, this.lineId);
    this.teamList = response.data.teamList;

    if (!!data.row.quantity) {
      this.quantityTeamForm.patchValue({ quantity: data.row.quantity });
    }
    if (!!data.row.teamId) {
      this.quantityTeamForm.patchValue({ team: data.row.teamId });
    }

    this.modalRef = this.modalService.open(this.content, { ariaLabelledBy: 'modal-team-title', size: 'xl' });
  }

  async saveQuantityTeam() {
    if (this.quantityTeamForm.invalid) {
      this.toastr.warning('Por favor complete todos los campos requeridos.', 'Advertencia');
      return;
    }
    let payload = {
      headerId: Number(this.headerId),
      lineId: Number(this.lineId),
      cant: Number(this.quantityTeamForm.value.quantity),
      teamId: Number(this.quantityTeamForm.value.team)
    };
    const response = await this.workOrderService.patchQuantityTeam(payload);
    if (response.status == 200) {
      this.toastr.success('Datos guardados correctamente.', 'Éxito');
      this.reloadEvent.emit();
      this.modalRef.close();
    } else {
      this.toastr.error(response.error.message, 'Error');
    }
  }
}
