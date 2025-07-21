import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { WorkflowService } from '../../workflow/workflow.service';
import { Alert } from 'src/app/helpers/alerts';
import { Title } from '@angular/platform-browser';
import { Session } from 'src/app/helpers/session.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  providers: [WorkflowService],
  standalone: false
})
export class InformationComponent implements OnInit {
  id = '';
  information = null;
  origin = '';
  inspectionType = '';
  operationTypes = { mantenimientoExterno: 'Mantenimiento Externo', na: 'N/A' };

  constructor(private router: Router, private route: ActivatedRoute, private workflowService: WorkflowService, private toastr: ToastrService, private titleService: Title) {}

  async ngOnInit() {
    this.id = this.route.snapshot.params?.['id'];

    await this.getIncomingInspection();
  }

  async getIncomingInspection() {
    let response = await this.workflowService.getIncomingInspection(this.id);
    if (!!response.data && !!response.data.data && !!response.data.data.inspection && !!response.data.data.inspection.headerId) {
      this.information = response.data.data.inspection;
      this.inspectionType = this.information.insType == 'HI' ? 'unit-inspection' : 'tire-inspection';
      this.origin = this.information.movementType == 'E' ? 'incoming-inspections' : 'quality-release';
      if (this.information.inspectStatus == 'C') {
        Session.setViewInsp(this.id);
      }

    } else {
      this.toastr.error('No se encontró información', 'Error');
    }
  }

  async next() {
    const edit = Session.isViewInsp(this.id);
    const currentUserId = Session.getUser().userId;

    try {
      const historyResponse = await this.workflowService.getInspectionHistory(this.information.headerId);
      const historyData = historyResponse?.data?.rows || [];

      if (historyData.length > 0) {
        const lastRecord = historyData[0];
        const lastUserId = lastRecord.inspector?.userId;
        const lastCreationDate = new Date(lastRecord.creationDate);
        const today = new Date();

        const isSameUser = lastUserId === currentUserId;
        const isSameDay =
          lastCreationDate.getFullYear() === today.getFullYear() &&
          lastCreationDate.getMonth() === today.getMonth() &&
          lastCreationDate.getDate() === today.getDate();

        if (isSameUser && isSameDay) {
          this.router.navigate([this.origin + '/edit/' + this.inspectionType, this.id]);
          return;
        }
      }
    } catch (error) {
      console.error('Error al obtener historial de inspección:', error);
    }

    const userDif = currentUserId != this.information?.inspector?.userId;
    const today = new Date();
    const inspectionDate = this.information?.inspectionDate ? new Date(this.information.inspectionDate) : null;
    const isSameDay =
      inspectionDate &&
      today.getFullYear() === inspectionDate.getFullYear() &&
      today.getMonth() === inspectionDate.getMonth() &&
      today.getDate() === inspectionDate.getDate();

    let title = 'Iniciar inspección';
    let detail = '<p>Al hacer clic en "continuar" va a activar la inspección.</p><p>Se guardará la fecha de inicio y su nombre en el historial de trabajo de esta inspección.</p><p>¿Desea iniciar la inspección?</p>';

    if (this.information?.inspectStatus != 'P' && userDif) {
      title = 'Continuar inspección';
      detail = detail.replace('iniciar', 'continuar');
    }

    if (!userDif && !isSameDay) {
      try {
        let response = await this.workflowService.patchProcessStart(this.id);
        if (!!response.data) {
          this.router.navigate([this.origin + '/edit/' + this.inspectionType, this.id]);
        } else {
          this.toastr.error(response.error?.error?.error || 'Error al actualizar la fecha de inspección', 'Error');
        }
      } catch (error) {
        this.toastr.error('Error al actualizar la fecha de inspección', 'Error');
      }
      return;
    }

    if (userDif) {
      if (!edit && (this.information?.inspectStatus == 'P' || userDif)) {
        if (await Alert.question(title, detail)) {
          let response = await this.workflowService.patchProcessStart(this.id);
          if (!!response.data) {
            this.router.navigate([this.origin + '/edit/' + this.inspectionType, this.id]);
          } else {
            this.toastr.error(response.error.error.error, 'Error');
          }
        }
      } else {
        this.router.navigate([this.origin + '/edit/' + this.inspectionType, this.id]);
      }
    } else {
      this.router.navigate([this.origin + '/edit/' + this.inspectionType, this.id]);
    }
  }

  formatDate(date: string | null): string {
    if (!date) {
      return 'N/A';
    }
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  }

  previous() {
    this.router.navigate([this.origin]);
  }
}
