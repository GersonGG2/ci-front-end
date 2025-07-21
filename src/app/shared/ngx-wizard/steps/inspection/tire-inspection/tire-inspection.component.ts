import { Component, OnInit, ViewChild, OnDestroy, DoCheck } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkflowService } from '../../../workflow/workflow.service';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';
import { FileService } from 'src/app/shared/services/file.service';
import { Session } from 'src/app/helpers/session.service';
import { LLComponent } from './LL/ll.component';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';

@Component({
  selector: 'app-tire-inspection',
  templateUrl: './tire-inspection.component.html',
  styleUrls: ['./tire-inspection.component.scss'],
  imports: [NgbNavModule, CommonModule, ReactiveFormsModule, LLComponent]
})
export class TireInspectionComponent implements OnInit, OnDestroy, DoCheck {

  @ViewChild(LLComponent) ll11Component: LLComponent;
  @ViewChild(LLComponent) ll12Component: LLComponent;
  @ViewChild(LLComponent) ll13Component: LLComponent;
  @ViewChild(LLComponent) ll14Component: LLComponent;
  @ViewChild(LLComponent) ll15Component: LLComponent;
  @ViewChild(LLComponent) ll16Component: LLComponent;
  @ViewChild(LLComponent) ll17Component: LLComponent;
  @ViewChild(LLComponent) ll18Component: LLComponent;

  LL11 = 'LL11';
  LL12 = 'LL12';
  LL13 = 'LL13';
  LL14 = 'LL14';
  LL15 = 'LL15';
  LL16 = 'LL16';
  LL17 = 'LL17';
  LL18 = 'LL18';

  active = 1;

  id = '';
  information = null;
  origin = '';
  inspectionType = '';

  constructor(private router: Router, private route: ActivatedRoute,
    private fileService: FileService,
    private workflowService: WorkflowService,
    private toastr: ToastrService,
    private breadcrumbService: BreadcrumbService) { }


  async ngOnInit() {
    this.id = this.route.snapshot.params?.['id'];
    await this.getIncomingInspection();
    //this.breadcrumbService.setSaveCallback(() => this.saveBeforeNavigation());
  }

  async ngDoCheck() {
    this.breadcrumbService.setShowModal(await this.hashChages(this.active))
  }

  ngOnDestroy() {
    this.breadcrumbService.clearSaveCallback();
  }

  private async saveBeforeNavigation(): Promise<void> {
    if (Session.isViewInsp(this.id)) return;

    try {
      await this.validateNavigation({ activeId: this.active });
    } catch (error) {
      console.error('Error al guardar antes de navegar:', error);
    }
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

  async onNavChange(event: any): Promise<void> {
    event.preventDefault();

    // Llama al servicio antes de cambiar de pestaña
    const canNavigate = await this.validateNavigation(event);
    this.active = event.nextId;

  }

  async validateNavigation(event: any): Promise<boolean> {

    if (Session.isViewInsp(this.id)) return true;

    //event.preventDefault();

    switch (event.activeId) {
      case 1:
        await this.ll11Component.savePlugins();
        break;
      case 2:
        await this.ll12Component.savePlugins();
        break;
      case 3:
        await this.ll13Component.savePlugins();
        break;
      case 4:
        await this.ll14Component.savePlugins();
        break;
      case 5:
        await this.ll15Component.savePlugins();
        break;
      case 6:
        await this.ll16Component.savePlugins();
        break;
      case 7:
        await this.ll17Component.savePlugins();
        break;
      case 8:
        await this.ll18Component.savePlugins();
        break;
    }

    return true;
  }

  isChangeForm(): boolean {
    let change = false;

    switch (this.active) {
      case 1:
        change = this.ll11Component.isChangeForm();
        break;
      case 2:
        change = this.ll12Component.isChangeForm();
        break;
      case 3:
        change = this.ll13Component.isChangeForm();
        break;
      case 4:
        change = this.ll14Component.isChangeForm();
        break;
      case 5:
        change = this.ll15Component.isChangeForm();
        break;
      case 6:
        change = this.ll16Component.isChangeForm();
        break;
      case 7:
        change = this.ll17Component.isChangeForm();
        break;
      case 8:
        change = this.ll18Component.isChangeForm();
        break;
    }
    return change;
  }

  async next(): Promise<void> {

    const changes = await this.isChangeForm();

    if (changes) {
      this.toastr.error('Por favor complete todos los campos requeridos', 'Aviso');
      return;
    }

    this.router.navigate([this.origin + '/edit/inspection-sheet', this.id]);
  }

  previous(): void {
    this.router.navigate([this.origin + '/edit/information', this.id]);
  }

  async captureImage(zone) {
    const element = document.getElementById('image-picture');
    if (element) {
      const canvas = await html2canvas(element);

      // Convierte el canvas a un Blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          // Crea un archivo a partir del Blob
          const file = new File([blob],
            zone + '.png',
            { type: 'image/png' });

          await this.fileService
            .uploadFiles(
              'INSPECTION_ZONE',
              Number(this.id),
              'ATACH/INS/' + this.id + '/PDF/',
              [file],
              true
            );

        }
      }, 'image/png');
    }
  }

  async hashChages(eventId):  Promise<boolean> {

    try {
      switch (eventId) {
        case 1:
          return await this.ll11Component.hasChanges();
        case 2:
          return await this.ll12Component.hasChanges();
        case 3:
          return await this.ll13Component.hasChanges();
        case 4:
          return await this.ll14Component.hasChanges();
        case 5:
          return await this.ll15Component.hasChanges();
        case 6:
          return await this.ll16Component.hasChanges();
        case 7:
          return await this.ll17Component.hasChanges();
        case 8:
          return await this.ll18Component.hasChanges();
      }
    } catch (error) { }

    return false;
  }


}
