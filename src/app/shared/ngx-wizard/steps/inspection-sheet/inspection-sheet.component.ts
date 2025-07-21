import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { WorkflowService } from '../../workflow/workflow.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-inspection-sheet',
  templateUrl: './inspection-sheet.component.html',
  styleUrl: './inspection-sheet.component.scss',
  imports: [NgxDatatableModule]
})
export class InspectionSheetComponent implements OnInit {
  id = '';
  information = null;
  origin = '';
  inspectionType = '';

  rows: any = new Array();

  constructor(private router: Router, private route: ActivatedRoute, private workflowService: WorkflowService, private toastr: ToastrService) {}

  async ngOnInit() {
    this.id = this.route.snapshot.params?.['id'];
    await this.getIncomingInspection();
    await this.getCustomerData();
  }

  private mapCustomerData(data: any): any[] {
    if(!data) return [];
    const mappedData = data.map((item: any) => {
      const zonaDano = `${item.zone_type ?? 'N/A'} ${item.dano_type ?? 'N/A'}`.trim();
      return {
        zona_dano: zonaDano,
        cant: item.cant || 0,
        actividades_codigo: item.serial_number_display_value || 'N/A'
      };
    });

    const sortedData = mappedData.sort((a, b) => {
      if (a.zona_dano === b.zona_dano) {
        return a.cant - b.cant;
      }
      return a.zona_dano.localeCompare(b.zona_dano);
    })
    return sortedData;
  }

  async getCustomerData() {
    let response = await this.workflowService.getCustomerData(this.id); 
    const data= response.data?.data?.data || [];
    this.rows = this.mapCustomerData(data);
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

  calculateTableHeight(rowCount: number, maxRows: number): number {
    const rowHeight = 60;
    const headerHeight = 50;
    const footerHeight = 50;
    const visibleRows = Math.min(rowCount, maxRows);
    return headerHeight + footerHeight + visibleRows * rowHeight;
  }

  next() {
    this.router.navigate([this.origin + '/edit/finish', this.id]);
  }

  previous() {
    this.router.navigate([this.origin + '/edit/' + this.inspectionType, this.id]);
  }
}
