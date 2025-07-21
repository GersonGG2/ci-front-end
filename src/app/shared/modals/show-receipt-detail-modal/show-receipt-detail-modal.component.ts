import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderService } from '../workOrderService.service';
import { ToastrService } from 'ngx-toastr';
import { GenericTableComponent } from "../../../features/component/generic-table/generictable.component";
import { DatePipe } from '@angular/common';
import { ReceiptsDetailComponent } from 'src/app/features/receipts/pages/receipts-detail/receipts-detail.component';
import { WorkOrdersDetailComponent } from '../../work-orders-helper/work-orders-detail/work-orders-detail.component';

@Component({
  selector: 'app-show-receipt-detail-modal',
  imports: [GenericTableComponent],
  templateUrl: './show-receipt-detail-modal.component.html',
  styleUrl: './show-receipt-detail-modal.component.scss',
  providers: [WorkOrderService]
})
export class ShowReceiptDetailModalComponent {

  @ViewChild('content', { static: true }) content: any;
  modalRef: NgbModalRef;

  constructor(private modalService: NgbModal, private workOrderService: WorkOrderService, private toastr: ToastrService, private datePipe: DatePipe) { }

  async openShowReceiptDetailModal(data: any) {
    const response = await this.workOrderService.getReceiptDetails(data.row.headerId);
    // Añadir estas líneas para procesar los datos
    if (response && response.data) {
      this.rows = this.handleResponse(response.data);
      this.totalItems = response.data.length;
    }
    this.modalRef = this.modalService.open(this.content, { ariaLabelledBy: 'modal-branch-title', size: 'xl' });
  }

  rows: any[] = [];
  totalItems: number = 0;
  page: number = 1;
  limit: number = 10;

  columns = [
    { prop: 'rcvHeaderId', name: 'ID', sortable: false, filter: false, customView: "idHtml" },
    { prop: 'receiptStatus', name: 'Estatus', sortable: false, filter: false, customView: "statusdHtml" },
    { prop: 'approver.fullName', name: 'Aprobado por', sortable: false, filter: false, width: 250, customView: "approverHtml" },
    { prop: 'warehouseman.fullName', name: 'Despachado por', sortable: false, filter: false, width: 250, customView: "dispatchHtml" },
    {
      prop: 'action',
      name: 'Acción',
      width: 100,
      lineal: true,
      actions: [
        { name: 'Eliminar', icon: 'eye', action: (e, row) => this.viewReceiptModal(e, row) },
        { name: 'Eliminar', icon: 'download', action: (e, row) => this.downloadPdfReceipt(e, row) },
      ]
    },
  ];

  handleResponse(response): any[] {
    return response.map((row) => {
      const idHtml = `${row.rcvHeaderId || '---'} </br> <span class="gray">${row.rcvDate ? this.datePipe.transform(row.rcvDate, 'dd-MM-yyyy') : '---'}</span>`
      const approverHtml = ` <span>${row.approver?.fullName || '---'}<br/> <span class="gray">${row.approvalDate ? this.datePipe.transform(row.approvalDate, 'dd-MM-yyyy') : '---'}</span>`
      const dispatchHtml = ` <span>${row.warehouseman?.fullName || '---'}<br/> <span class="gray">${row.dispatchDate ? this.datePipe.transform(row.dispatchDate, 'dd-MM-yyyy') : '---'}</span>`

      let statusClass = '';
      const status = row.receiptStatus || '---';

      switch (status) {
        case 'Nuevo':
          statusClass = 'bg-secondary text-white';
          break;
        case 'Aprobado':
          statusClass = 'bg-info text-white';
          break;
        case 'Rechazado':
          statusClass = 'bg-danger text-white';
          break;
        case 'Entregado':
          statusClass = 'bg-success text-white';
          break;
        default:
          statusClass = 'bg-light text-dark';
      }

      const statusdHtml = `<span class="badge ${statusClass}">${status}</span>`;

      return {
        ...row,
        idHtml,
        approverHtml,
        statusdHtml,
        dispatchHtml
      }
    })
  }

  async downloadPdfReceipt(e: any, row: any) {
    try {

      const headerId = row.odtHeaderId;
      const rcvHeaderId = row.rcvHeaderId;

      if (!headerId || !rcvHeaderId) {
        this.toastr.error('Datos insuficientes para generar el PDF', 'Error');
        return;
      }

      // Llamar al servicio para obtener el PDF
      const pdfBlob = await this.workOrderService.getPlanDispatchPrint(headerId, rcvHeaderId);

      // Crear una URL para el blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_${rcvHeaderId}.pdf`;

      // Añadir al DOM, hacer clic y limpiar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.toastr.success('Documento PDF generado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      this.toastr.error('No se pudo descargar el PDF. Por favor, intente de nuevo más tarde.', 'Error');
    }
  }

    viewReceiptModal(e: any, row: any) {
    // Si hay un modal actual, cerrarlo primero
    if (this.modalRef) {
      this.modalRef.close();
    }
  
    // Listener para cerrar el modal cuando se dispare el evento desde el componente hijo
    const listener = () => {
      modalRef.close();
      window.removeEventListener('closeWorkOrdersDetailModal', listener);
    };
    window.addEventListener('closeWorkOrdersDetailModal', listener);
  
    // Abrir un nuevo modal con el componente WorkOrdersDetailComponent
    const modalRef = this.modalService.open(WorkOrdersDetailComponent, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      scrollable: true,
      windowClass: 'work-orders-detail-modal'
    });
  
    // Pasar los datos necesarios
    const componentInstance = modalRef.componentInstance;
    componentInstance.isModal = true;
    componentInstance.rcvHeaderId = row.rcvHeaderId;
    componentInstance.odtHeaderId = row.odtHeaderId;
  
    // Manejar el cierre del modal
    modalRef.result.then(
      (result) => {
        window.removeEventListener('closeWorkOrdersDetailModal', listener);
        // Reabrir el modal original
        this.modalRef = this.modalService.open(this.content, {
          ariaLabelledBy: 'modal-branch-title',
          size: 'xl'
        });
      },
      (reason) => {
        window.removeEventListener('closeWorkOrdersDetailModal', listener);
        // Reabrir el modal original
        this.modalRef = this.modalService.open(this.content, {
          ariaLabelledBy: 'modal-branch-title',
          size: 'xl'
        });
      }
    );
  }


}
