import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderService } from '../workOrderService.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';

@Component({
  selector: 'app-dispatch-receipt-log-modal',
  imports: [CommonModule, FeatherModule, FormsModule],
  templateUrl: './dispatch-receipt-log-modal.component.html',
  styleUrl: './dispatch-receipt-log-modal.component.scss',
  providers: [WorkOrderService]
})

export class DispatchReceiptLogModalComponent {
  @ViewChild('content', { static: true }) content: any;
  modalRef: NgbModalRef;


  receiptsData: any = null;
  searchTerm: string = '';
  expandedReceiptIds: Set<number> = new Set();
  constructor(private modalService: NgbModal, private workOrderService: WorkOrderService, private toastr: ToastrService) { }

  // async openDispatchReceiptLogModal(data: any) {
  //   try {
  //     // Llamar al servicio y guardar la respuesta
  //     const response = await this.workOrderService.getDispatchViewReceipt(data.headerId);

  //     // Asignar los datos a la propiedad que usa el template
  //     this.receiptsData = response;

  //     // Limpiar el estado anterior
  //     this.expandedReceiptIds.clear();
  //     this.searchTerm = '';

  //     // Abrir el modal
  //     this.modalRef = this.modalService.open(this.content, {
  //       ariaLabelledBy: 'modal-branch-title',
  //       size: 'xl',
  //       scrollable: true
  //     });
  //   } catch (error) {
  //     console.error('Error al cargar los recibos:', error);
  //     this.toastr.error('No se pudieron cargar los datos de recibos', 'Error');
  //   }
  // }

  // Método para controlar expansión de acordeones
  toggleReceipt(receiptId: number) {
    if (this.expandedReceiptIds.has(receiptId)) {
      this.expandedReceiptIds.delete(receiptId);
    } else {
      this.expandedReceiptIds.add(receiptId);
    }
  }

  // Método para verificar si un recibo está expandido
  isReceiptExpanded(receiptId: number): boolean {
    return this.expandedReceiptIds.has(receiptId);
  }
  async downloadPdf(receipt: any) {
    if (!receipt || !receipt.rcvHeaderId) {
      this.toastr.error('No se puede descargar el PDF. Datos incompletos.', 'Error');
      return;
    }
    const headerId = receipt.odtHeaderId || this.receiptsData?.headerData?.headerData?.headerId;
    if (!headerId) {
      this.toastr.error('No se puede identificar el encabezado', 'Error');
      return;
    }
    try {
      const serialNumber = this.receiptsData?.headerData?.headerData?.serialNumber || '';
      const odtFolio = this.receiptsData?.headerData?.headerData?.odtFolio || '';
      const fileName = `${serialNumber}-${odtFolio}.pdf`;
      const blob = await this.workOrderService.getPlanDispatchPrint(headerId, receipt.rcvHeaderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.toastr.success('PDF descargado correctamente', 'Éxito');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      this.toastr.error('Error al descargar el PDF', 'Error');
    }
  }

  filteredReceipts: any[] = [];

  applyFilter() {
    if (!this.receiptsData?.lineData) {
      this.filteredReceipts = [];
      return;
    }

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredReceipts = this.receiptsData.lineData;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredReceipts = this.receiptsData.lineData.filter(receipt => {
      return receipt.distData?.some((item: any) => {
        const itemCode = item?.distribution?.itemComponent?.toLowerCase() || '';
        const itemDesc = item?.distribution?.itemDescription?.toLowerCase() || '';
        return itemCode.includes(term) || itemDesc.includes(term);
      });
    });
  }

  // Método para limpiar el filtro cuando se hace clic en el botón X
  clearFilter() {
    this.searchTerm = '';
    if (this.receiptsData?.lineData) {
      this.filteredReceipts = this.receiptsData.lineData;
    }
  }

  // Modificar el método existente para inicializar filteredReceipts
  async openDispatchReceiptLogModal(data: any) {
    try {
      const response = await this.workOrderService.getDispatchViewReceipt(data.headerId);
      this.receiptsData = response;
      this.filteredReceipts = this.receiptsData?.lineData || [];
      this.expandedReceiptIds.clear();
      this.searchTerm = '';
      this.modalRef = this.modalService.open(this.content, {
        ariaLabelledBy: 'modal-branch-title',
        size: 'xl',
        scrollable: true
      });
    } catch (error) {
      console.error('Error al cargar los recibos:', error);
      this.toastr.error('No se pudieron cargar los datos de recibos', 'Error');
    }
  }
}
