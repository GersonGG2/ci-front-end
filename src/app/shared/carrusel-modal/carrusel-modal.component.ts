import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbCarouselModule, NgbCarouselConfig, NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import { ImgRetryComponent } from '../img-retry.component';

@Component({
  selector: 'app-carrusel-modal',
  imports: [NgbCarouselModule, ImgRetryComponent],
  templateUrl: './carrusel-modal.component.html',
  styleUrl: './carrusel-modal.component.scss'
})
export class CarruselModalComponent {
  @ViewChild('carruselModal', { static: true }) carruselModal: any;
  @ViewChild('carousel', { static: true }) carousel: NgbCarousel = Object.create(null);

  carruselModalRef: NgbModalRef;
  title = '';
  images: any[] = [];

  constructor(private modalService: NgbModal, config: NgbCarouselConfig) {
    config.showNavigationArrows = true;
    config.showNavigationIndicators = true;
  }

  async openCarruselModal(title: string, allUrls: string[], opcion: boolean = false) {
    this.title = title;
    this.images = [];
    for await (const url of allUrls) {
      let parts = url.split('/');
      if (parts.length > 0) {
        // let imageName = parts[parts.length - 1];
        let imageNameWithFormat = parts[parts.length - 1];
        let imageName = opcion
          ? imageNameWithFormat.replace(/\.[^/.]+$/, "")
          : imageNameWithFormat;
        this.images.push({ imageName: imageName, url: url });
      }
    }
    this.carruselModalRef = this.modalService.open(this.carruselModal, { size: 'lg', backdrop: 'static' });
  }
}
