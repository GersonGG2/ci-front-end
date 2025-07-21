import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-viewer-modal',
  templateUrl: './pdf-viewer-modal.component.html',
  styleUrls: ['./pdf-viewer-modal.component.scss']
})
export class PdfViewerModalComponent {
  @ViewChild('pdfViewerModal', { static: true }) pdfViewerModal: any;

  pdfModalRef: NgbModalRef;
  title = '';
  pdfSrc: SafeResourceUrl;

  constructor(
    private modalService: NgbModal,
    private sanitizer: DomSanitizer
  ) {}

  /**
   * Abre un modal con el visor de PDF
   * @param title Título que se mostrará en el modal
   * @param blobOrUrl Puede ser un Blob o una URL del PDF
   */
    openPdfModal(title: string, blobOrUrl: Blob | string): void {
    this.title = title;
    
    let url: string;
    
    if (typeof blobOrUrl === 'string') {
      url = blobOrUrl;
    } else {
      url = window.URL.createObjectURL(blobOrUrl);
    }
    
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    
    this.pdfModalRef = this.modalService.open(this.pdfViewerModal, {
      fullscreen: true,  
      centered: true,
      backdrop: 'static',
      windowClass: 'pdf-viewer-modal-fullscreen' 
    });
    
    if (typeof blobOrUrl !== 'string') {
      this.pdfModalRef.dismissed.subscribe(() => {
        window.URL.revokeObjectURL(url);
      });
      
      this.pdfModalRef.closed.subscribe(() => {
        window.URL.revokeObjectURL(url);
      });
    }
  }
}