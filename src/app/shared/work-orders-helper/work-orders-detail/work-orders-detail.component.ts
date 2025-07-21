import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrdersHelperService } from 'src/app/shared/work-orders-helper/services/work-orders-helper.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-work-orders-detail',
  imports: [CommonModule, FeatherModule, FormsModule],
  templateUrl: './work-orders-detail.component.html',
  styleUrl: './work-orders-detail.component.scss',
  providers: [DatePipe, WorkOrdersHelperService]
})
export class WorkOrdersDetailComponent implements OnInit {
  @Input() isModal: boolean = false;
  @Input() rcvHeaderId: string = '';  // Añadir este input
  @Input() odtHeaderId: string = '';  // Añadir este input


  @ViewChild('branchSelectionModal') branchModal!: TemplateRef<any>;
  @ViewChild('approvalModal') approvalModal!: TemplateRef<any>;


  receiptId: string = '';
  receipt: any = null;
  error: string = '';

  // rcvHeaderId: string = '';
  // odtHeaderId: string = '';

  selectedBranchId: number | null = null;
  branches: any[] = [];

  isDownloadingPdf = false;

  origin = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workOrdersHelperService: WorkOrdersHelperService,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    if (!this.isModal) {
      // Comportamiento actual para página normal
      this.route.params.subscribe((params) => {
        this.rcvHeaderId = params['rcvHeaderId'];
        this.odtHeaderId = params['odtHeaderId'];
        let path = this.router.url.split('/');
        this.origin = path[1];
        this.loadDetails();
      });
    } else {
      // Ya tenemos rcvHeaderId y odtHeaderId asignados directamente
      this.origin = 'receipts';
      this.loadDetails();
    }
  }

  goBackToTable() {
    if (this.isModal) {
      // En modo modal, simplemente disparamos un evento en window para que el modal padre lo capture
      window.dispatchEvent(new CustomEvent('closeWorkOrdersDetailModal'));
    }
  }
  async loadDetails() {
    if (this.origin == 'receipts' || this.origin == 'misc-receipts' || this.origin == 'receipt-reissue') {
      try {
        const response = await this.workOrdersHelperService.getReceiptById(
          Number(this.rcvHeaderId),
          Number(this.odtHeaderId)
        );

        if (response && response.data) {
          this.receipt = response.data.data;
          this.receipt.lineData = response.data.lineData;

          this.isSupervisor = response.data.isSupervisor || false;

          if (response.data.branchList && response.data.branchList.length > 0) {
            this.branches = response.data.branchList;
          }
        } else {
          this.error = 'No se encontró información del recibo';
        }
      } catch (error) {
        console.error('Error al cargar los detalles del recibo:', error);
        this.error = 'Error al cargar los detalles del recibo';
      }
    }
  }

  goBack() {
    this.router.navigate([this.origin]);
  }

  // Método para abrir el modal de sucursal temporal
  openBranchModal(content: any) {
    if (!this.canChangeBranch()) {
      this.toastr.warning('No se puede cambiar la sucursal con el estado actual del recibo');
      return;
    }

    this.selectedBranchId = this.receipt.branchId || null;
    this.modalService.open(content, { ariaLabelledBy: 'modal-branch-title' });
  }

  // Método para actualizar la sucursal
  async updateBranch(modalRef: NgbModalRef) {
    if (this.selectedBranchId !== null) {
      const selectedBranch = this.branches.find(
        (branch) => branch.branchId === Number(this.selectedBranchId)
      );

      if (selectedBranch) {
        try {
          // CAMBIO IMPORTANTE: Usar headerId en lugar de rcvHeaderId
          await this.workOrdersHelperService.updateReceiptBranch(
            Number(this.receipt.headerId), // Usar el headerId de la orden de trabajo
            Number(this.selectedBranchId)
          );

          const shortName = selectedBranch.displayValue.match(/\[(.*?)\]/)?.[1] || '';
          this.receipt.branch = {
            branchId: selectedBranch.branchId,
            branchName: selectedBranch.branchName,
            shortName: shortName
          };

          this.toastr.success('La sucursal ha sido actualizada correctamente', 'Actualización exitosa');
          modalRef.close('Branch updated');

        } catch (error) {
          console.error('Error al actualizar la sucursal:', error);
          this.toastr.error('No se pudo actualizar la sucursal', 'Error');
        }
      }
    } else {
      this.toastr.warning('Por favor selecciona una sucursal', 'Advertencia');
    }
  }

  //  Metodo para descargar pdf temporal
  async pdfDownload() {
    if (!this.receipt || !this.receipt.receipts || this.receipt.receipts.length === 0) {
      console.error('No hay datos del recibo disponibles');
      return;
    }

    try {
      this.isDownloadingPdf = true;

      const pdfBlob = await this.workOrdersHelperService.downloadReceiptPdf(
        Number(this.rcvHeaderId),
        Number(this.odtHeaderId)
      );

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-OT-${this.receipt.serialNumber || this.rcvHeaderId}-${this.receipt.odtFolio || this.odtHeaderId}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('No se pudo descargar el PDF. Por favor, intente de nuevo más tarde.');
    } finally {
      this.isDownloadingPdf = false;
    }
  }

  // Método para verificar si se puede cambiar la sucursal según el estatus
  canChangeBranch(): boolean {
    const status = this.receipt?.receipts?.[0]?.receiptStatus;
    return status === 'Nuevo' || status === 'Rechazado' || status === 'Aprobado';
  }

  // Metodos para cambiar la cantidad solo cuando el estado sea Nuevo
  isStatusNew(): boolean {
    return this.receipt?.receipts?.[0]?.receiptStatus === 'Nuevo';
  }

  // Método para actualizar la cantidad a entregar
  updateDeliveredQuantity(item: any, event: any) {
    const newValue = parseInt(event.target.value, 10);

    // Validar que el valor sea un número válido
    if (isNaN(newValue) || newValue < 0) {
      event.target.value = item.deliveredQuantity || 0;
      return;
    }

    // Validar que no exceda la cantidad recibida
    if (newValue > item.receivedQuantity) {
      this.toastr.error(
        'La cantidad a entregar no puede ser mayor a la cantidad recibida',
        'Error'
      );
      event.target.value = Math.min(item.deliveredQuantity || 0, item.receivedQuantity);
      return;
    }

    // Actualizar solo si hay cambios
    if (item.deliveredQuantity !== newValue) {
      item.deliveredQuantity = newValue;
      this.hasChanges = true;
    }
  }

  // Propiedad para rastrear cambios
  hasChanges = false;

  async saveChanges() {

    if (!this.hasChanges) {
      this.toastr.info('No hay cambios para guardar');
      return;
    }

    if (!this.receipt || !this.receipt.receipts || this.receipt.receipts.length === 0) {
      this.toastr.error('No hay datos del recibo disponibles', 'Error');
      return;
    }

    try {
      // Verificar que tengamos el rcvHeaderId necesario
      if (!this.rcvHeaderId) {
        this.toastr.error('No se pudo identificar el ID del recibo', 'Error');
        return;
      }

      // Verificar que tengamos datos de línea
      if (!this.receipt.lineData || this.receipt.lineData.length === 0) {
        this.toastr.error('No hay líneas de recibo para actualizar', 'Error');
        return;
      }

      // Preparar el payload con los valores correctos según la API
      const payload = {
        rcvHeaderId: Number(this.rcvHeaderId),
        lineData: this.receipt.lineData.map(item => ({
          rcvLineId: Number(item.rcvLineId),
          receivedQuantity: Number(item.receivedQuantity || 0),
          deliveredQuantity: Number(item.deliveredQuantity || 0)
        }))
      };

      // Enviar los datos al servicio
      const response = await this.workOrdersHelperService.saveReceiptLineData(payload);

      this.toastr.success('Registro actualizado exitosamente', 'Éxito');
      this.hasChanges = false;
    } catch (error) {
      console.error('Error completo al guardar los cambios:', error);

      // Mostrar mensaje más específico si hay información de error
      let errorMessage = 'No se pudieron guardar los cambios.';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }

      this.toastr.error(errorMessage, 'Error');
    }
  }

  selectedStatus: string = '';
  isSupervisor: boolean = false;

  openApprovalModal() {
    this.selectedStatus = '';
    this.modalService.open(this.approvalModal, {
      centered: true,
      backdrop: 'static'
    });
  }

  // 5. Añade el método para procesar la aprobación/rechazo
  async processApproval(modal: NgbModalRef) {
    try {
      if (!this.selectedStatus) {
        this.toastr.warning('Debe seleccionar una acción', 'Advertencia');
        return;
      }
      const receiptId = this.receipt.receipts?.[0]?.rcvHeaderId;
      if (!receiptId) {
        this.toastr.error('No se encontró el ID del recibo', 'Error');
        return;
      }
      const response = await this.workOrdersHelperService.updateReceiptStatus(
        receiptId,
        this.selectedStatus
      );

      if (response && response.status === 200) {
        this.toastr.success(`Recibo ${this.selectedStatus.toLowerCase()} exitosamente`, 'Éxito');
        await this.loadDetails();
        modal.close();
      } else {
        this.toastr.error(response?.message || 'Error al actualizar el estatus', 'Error');
      }
    } catch (error) {
      console.error('Error al procesar aprobación:', error);
      this.toastr.error('Error al procesar la acción. Inténtelo nuevamente.', 'Error');
    }
  }
}
