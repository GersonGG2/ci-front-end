import { Component, OnInit, ViewChild, OnDestroy, DoCheck } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FreComponent } from '../unit-inspection/fre/fre.component';
import { CiComponent } from '../unit-inspection/ci/ci.component';
import { TraComponent } from '../unit-inspection/tra/tra.component';
import { IntComponent } from '../unit-inspection/int/int.component';
import { CdComponent } from '../unit-inspection/cd/cd.component';
import { InfComponent } from '../unit-inspection/inf/inf.component';
import { TolComponent } from '../unit-inspection/tol/tol.component';
import { DocComponent } from '../unit-inspection/doc/doc.component';
import { WorkflowService } from '../../../workflow/workflow.service';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';
import { FileService } from 'src/app/shared/services/file.service';
import { HiddenNumberStateService } from './hidden-number-state.service';
import { Alert } from 'src/app/helpers/alerts';
import { Session } from 'src/app/helpers/session.service';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';

@Component({
  selector: 'app-unit-inspection',
  templateUrl: './unit-inspection.component.html',
  styleUrls: ['./unit-inspection.component.scss'],
  imports: [NgbNavModule, CommonModule, ReactiveFormsModule, FreComponent, CiComponent, TraComponent, IntComponent, CdComponent, InfComponent, TolComponent, DocComponent]
})
export class UnitInspectionComponent implements OnInit, OnDestroy, DoCheck {
  @ViewChild(FreComponent) freComponent: FreComponent;
  @ViewChild(CiComponent) ciComponent: CiComponent;
  @ViewChild(TraComponent) traComponent: TraComponent;
  @ViewChild(IntComponent) intComponent: IntComponent;
  @ViewChild(CdComponent) cdComponent: CdComponent;
  @ViewChild(InfComponent) infComponent: InfComponent;
  @ViewChild(TolComponent) tolComponent: TolComponent;
  @ViewChild(DocComponent) docComponent: DocComponent;

  active = 1;

  id = '';
  information = null;
  origin = '';
  inspectionType = '';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private workflowService: WorkflowService,
    private toastr: ToastrService,
    private hiddenNumberStateService: HiddenNumberStateService,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngDoCheck() {
    this.breadcrumbService.setShowModal(this.hashChages(this.active))
  }

  async ngOnInit() {
    this.id = this.route.snapshot.params?.['id'];
    await this.getIncomingInspection();
  }

  ngOnDestroy() {
    // Limpiar la función de guardado al destruir el componente
    this.breadcrumbService.clearSaveCallback();
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

    event.init = false;
    // Llama al servicio antes de cambiar de pestaña
    const canNavigate = await this.validateNavigation(event, true);
    if (canNavigate) { this.active = event.nextId; }

  }

  async validateNavigation(event: any, save = false): Promise<boolean> {

    if (Session.isViewInsp(this.id)) return true;

    // Validar Placa VIN antes de permitir la navegación
    if (event.activeId === 1) { // FRE component
      const vinPlateValue = this.freComponent.pluginsForm.value.vinPlate;
      const plateVinPhotos = [
        ...(this.freComponent.plateVinPhotos || []),
        ...(this.freComponent.plateVinPhotosTemp || [])
      ];

      if (vinPlateValue === 'Y' && (!plateVinPhotos || plateVinPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }

      // Validar No. Oculto para FRE
      const hiddenNumberValue = this.freComponent.pluginsForm.value.hiddenNumber;
      const hiddenNumberPhotos = [
        ...(this.freComponent.hiddenNumberPhotos || []),
        ...(this.freComponent.hiddenNumberPhotosTemp || [])
      ];

      if (hiddenNumberValue === 'Y' && (!hiddenNumberPhotos || hiddenNumberPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }
    } else if (event.activeId === 3) { // TRA component
      const vinPlateValue = this.traComponent.pluginsForm.value.vinPlate;
      const plateVinPhotos = [
        ...(this.traComponent.plateVinPhotos || []),
        ...(this.traComponent.plateVinPhotosTemp || [])
      ];

      if (vinPlateValue === 'Y' && (!plateVinPhotos || plateVinPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }

      // Validar No. Oculto para TRA
      const hiddenNumberValue = this.traComponent.pluginsForm.value.hiddenNumber;
      const hiddenNumberPhotos = [
        ...(this.traComponent.hiddenNumberPhotos || []),
        ...(this.traComponent.hiddenNumberPhotosTemp || [])
      ];

      if (hiddenNumberValue === 'Y' && (!hiddenNumberPhotos || hiddenNumberPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }
    } else if (event.activeId === 8) { // DOC component
      const vinPlateValue = this.docComponent.pluginsForm.value.vinPlate;
    }

    // Validar No. Oculto para otros componentes
    if (event.activeId === 2) { // CI component
      const hiddenNumberValue = this.ciComponent.pluginsForm.value.hiddenNumber;
      const hiddenNumberPhotos = [
        ...(this.ciComponent.hiddenNumberPhotos || []),
        ...(this.ciComponent.hiddenNumberPhotosTemp || [])
      ];

      if (hiddenNumberValue === 'Y' && (!hiddenNumberPhotos || hiddenNumberPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }
    } else if (event.activeId === 4) { // INT component
      const hiddenNumberValue = this.intComponent.pluginsForm.value.hiddenNumber;
      const hiddenNumberPhotos = [
        ...(this.intComponent.hiddenNumberPhotos || []),
        ...(this.intComponent.hiddenNumberPhotosTemp || [])
      ];

      if (hiddenNumberValue === 'Y' && (!hiddenNumberPhotos || hiddenNumberPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }
    } else if (event.activeId === 5) { // CD component
      const hiddenNumberValue = this.cdComponent.pluginsForm.value.hiddenNumber;
      const hiddenNumberPhotos = [
        ...(this.cdComponent.hiddenNumberPhotos || []),
        ...(this.cdComponent.hiddenNumberPhotosTemp || [])
      ];

      if (hiddenNumberValue === 'Y' && (!hiddenNumberPhotos || hiddenNumberPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }
    } else if (event.activeId === 6) { // INF component
      const hiddenNumberValue = this.infComponent.pluginsForm.value.hiddenNumber;
      const hiddenNumberPhotos = [
        ...(this.infComponent.hiddenNumberPhotos || []),
        ...(this.infComponent.hiddenNumberPhotosTemp || [])
      ];

      if (hiddenNumberValue === 'Y' && (!hiddenNumberPhotos || hiddenNumberPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }
    } else if (event.activeId === 7) { // TOL component
      const hiddenNumberValue = this.tolComponent.pluginsForm.value.hiddenNumber;
      const hiddenNumberPhotos = [
        ...(this.tolComponent.hiddenNumberPhotos || []),
        ...(this.tolComponent.hiddenNumberPhotosTemp || [])
      ];

      if (hiddenNumberValue === 'Y' && (!hiddenNumberPhotos || hiddenNumberPhotos.length === 0)) {
        this.toastr.error('Por favor, completa los campos requeridos');
        return false;
      }
    }

    if (save) this.savePlugins(event);

    return true;
  }

  async savePlugins(event) {
    switch (event.activeId) {
      case 1:
        if (!(await this.freComponent.savePlugins())) return false;
        break;
      case 2:
        if (!(await this.ciComponent.savePlugins())) return false;
        break;
      case 3:
        if (!(await this.traComponent.savePlugins())) return false;
        break;
      case 4:
        if (!(await this.intComponent.savePlugins())) return false;
        break;
      case 5:
        if (!(await this.cdComponent.savePlugins())) return false;
        break;
      case 6:
        if (!(await this.infComponent.savePlugins())) return false;
        break;
      case 7:
        if (!(await this.tolComponent.savePlugins())) return false;
        break;
      case 8:
        await this.docComponent.savePlugins();
        break;
    }

    this.breadcrumbService.showModal.set(false);

    return true;
  }



  async next() {
    const selectedTab = this.hiddenNumberStateService.getSelectedTab();

    // Validar Placa VIN antes de permitir la navegación final
    const canNavigate = await this.validateNavigation({ activeId: this.active, init: false });
    if (!canNavigate) {
      return; // No continuar si la validación falla
    }

    if (!selectedTab && !Session.isViewInsp(this.id)) {
      if (await Alert.question(
        'NUMEROS OCULTOS',
        '<p>Esta por finalizar la inspeccion SIN NUMEROS OCULTOS.</p><p>¿Desea continuar?</p>'
      )
      ) {
        this.savePlugins({ activeId: this.active });
        this.router.navigate([this.origin + '/edit/inspection-sheet', this.id]);
      }

    } else {
      this.savePlugins({ activeId: this.active });
      this.router.navigate([this.origin + '/edit/inspection-sheet', this.id]);
    }

  }

  previous(): void {
    this.router.navigate([this.origin + '/edit/information', this.id]);
  }

  async forceSave() {
    await this.savePlugins({ activeId: this.active, init: false });
  }

  isTDA(key) {
    let options = ['FRE', 'CI', 'TRA', 'INT', 'CD', 'INF', 'TOL', 'DOC'];
    if (this.information?.itemCode == 'TDA') options = ['FRE', 'CI', 'TRA', 'CD', 'INF', 'TOL'];
    return options.includes(key);
  }

  hashChages(eventId): boolean {

    try {
      switch (eventId) {
        case 1:
          return this.freComponent.hasChanges();
        case 2:
          return this.ciComponent.hasChanges();
        case 3:
          return this.traComponent.hasChanges();
        case 4:
          return this.intComponent.hasChanges();
        case 5:
          return this.cdComponent.hasChanges();
        case 6:
          return this.infComponent.hasChanges();
        case 7:
          return this.tolComponent.hasChanges();
        case 8:
          return this.docComponent.hasChanges();
      }

    } catch (error) { }

    return false;
  }

}

export async function captureImage(zone: string, id: string, fileService: FileService): Promise<void> {
  
  await new Promise(resolve => setTimeout(resolve, 10)); // Esperar un segundo para asegurar que el DOM esté listo
  
  const element = document.getElementById('image-picture');
  if (element) {
    const canvas = await html2canvas(element);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `${zone}.png`, { type: 'image/png' });

        await fileService
          .uploadFiles(
            'INSPECTION_ZONE',
            Number(id),
            `ATACH/INS/${id}/PDF/`,
            [file],
            true
          );
      }
    }, 'image/png');
  }
}
