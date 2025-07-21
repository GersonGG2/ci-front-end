import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { WorkflowService } from '../../workflow/workflow.service';
import jsPDF from 'jspdf';
import { FileService } from 'src/app/shared/services/file.service';

@Component({
  selector: 'app-finish',
  templateUrl: './finish.component.html',
  styleUrl: './finish.component.scss',
  standalone: false
})
export class FinishComponent implements OnInit {
  id = '';
  information = null;
  origin = '';
  inspectionType = '';

  constructor(private router: Router, private route: ActivatedRoute, private workflowService: WorkflowService, private toastr: ToastrService,private fileService: FileService) {}

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
    } else {
      this.toastr.error('No se encontró información', 'Error');
    }
  }

    async downloadPDF() {
    try {
      if (!this.information || !this.information.headerId) {
        return;
      }
  
      const blob = await this.fileService.getInspectionPdf(this.information.headerId, false);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inspeccion_${this.information.serialNumber || 'SN'}_${this.information.headerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar la hoja de inspección:', error);
    }
  }
  

  async next() {
    try {
      if (this.information?.inspectStatus === 'C') {
        this.router.navigate([this.origin]);
      } else {
        let response = await this.workflowService.finishInspection(Number(this.id));
        if (response.error) {
          this.toastr.error(response.error.error.error, 'Error');
          this.router.navigate([this.origin]);
          if (response.error.error.error === 'Failed to create OT') {
            // REVISAR
            this.toastr.success(response.data.message, 'Éxito');
            this.router.navigate([this.origin]);
          }
        } else {
          this.toastr.success(response.data.message, 'Éxito');
          this.router.navigate([this.origin]);
        }
      }
    } catch (error) {
      this.toastr.error('Error al finalizar la inspección', 'Error');
    }
  }

  previous() {
    this.router.navigate([this.origin + '/edit/inspection-sheet', this.id]);
  }
}
