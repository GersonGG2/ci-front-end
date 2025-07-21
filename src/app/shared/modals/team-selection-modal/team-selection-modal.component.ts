import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderService } from '../workOrderService.service';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-team-selection-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgSelectComponent, NgOptionComponent],
  templateUrl: './team-selection-modal.component.html',
  styleUrl: './team-selection-modal.component.scss',
  providers: [WorkOrderService]
})
export class TeamSelectionModalComponent {
  @ViewChild('content', { static: true }) content: any;
  modalRef: NgbModalRef;
  @Output() reloadEvent = new EventEmitter<any>();

  headerId: string = '';
  teamList: any[] = [];

  teamForm = this.fb.group({
    team: [null]
  });

  constructor(private modalService: NgbModal, private fb: FormBuilder, private workOrderService: WorkOrderService, private toastr: ToastrService) {}

  async openTeamSelectionModal(data: any) {
    this.headerId = data.header.headerId;
    const response = await this.workOrderService.getPlanHeaderData(this.headerId);
    this.teamList = response.data.teamList;

    if (!!data.header.teamId) {
      this.teamForm.patchValue({ team: data.header.teamId });
    }

    this.modalRef = this.modalService.open(this.content, { ariaLabelledBy: 'modal-team-title' });
  }

  async assignTeam() {
    if (this.teamForm.invalid) {
      this.toastr.warning('Por favor complete todos los campos requeridos.', 'Advertencia');
      return;
    }
    let payload = {
      headerId: Number(this.headerId),
      teamId: Number(this.teamForm.value.team)
    };
    const response = await this.workOrderService.postAssignHeaderTeam(payload);
    if (!!response.data) {
      this.toastr.success('Asignación exitosa.', 'Éxito');
      this.reloadEvent.emit();
      this.modalRef.close();
    } else {
      this.toastr.error(response.error.message, 'Error');
    }
  }
}
