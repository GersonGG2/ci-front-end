import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkflowService } from 'src/app/shared/ngx-wizard/workflow/workflow.service';
import { DanioI, ZoneINFI } from 'src/app/shared/ngx-wizard/workflow/workflow.model';

import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DamagesModalComponent } from 'src/app/shared/ngx-wizard/damages-modal/damages-modal.component';
import { FileService } from 'src/app/shared/services/file.service';
import { HiddenNumberStateService } from '../hidden-number-state.service';
import { Alert } from 'src/app/helpers/alerts';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ImgRetryComponent } from 'src/app/shared/img-retry.component';
import { Session } from 'src/app/helpers/session.service';
import { captureImage } from '../unit-inspection.component';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';

@Component({
  selector: 'app-inf',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbNavModule, DamagesModalComponent, NgSelectComponent, ImgRetryComponent],
  templateUrl: './inf.component.html',
  styleUrls: ['../unit-inspection.component.scss']
})
export class InfComponent implements OnInit {
  id = '';
  itemCode = '';
  spikeList: any[] = [];
  rollerSkatesList: any[] = [];

  pluginsForm = this.fb.group({
    spike: [null],
    rollerSkates: [null],
    axis1: [''],
    axis2: [''],
    hiddenNumber: ['N'],
    comment: ['']
  });

  damageStatus = '';
  damageCount = 0; // Contador de daños
  circles: any[] = [];

  active2 = 'top';

  hiddenNumberPhotos: any[] = [];
  generalPhotos: any[] = [];
  hiddenNumberPhotosTemp: any[] = [];
  generalPhotosTemp: any[] = [];


  module = '';
  zoneType = 'INF';

  zoneINFI = {} as ZoneINFI;

  disableHiddenNumber = false;
  changes = false;
  loadDamage = () => { }


  /* DAMAGESMODAL */
  @ViewChild('damagesModal', { static: true }) damagesModal: DamagesModalComponent;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private workflowService: WorkflowService,
    private toastr: ToastrService,
    private fileService: FileService,
    private hiddenNumberStateService: HiddenNumberStateService,
  ) { }

  async ngOnInit() {
    this.pluginsForm = this.fb.group({
      spike: [null],
      rollerSkates: [null],
      axis1: ['4'],
      axis2: ['na'],
      hiddenNumber: ['N'],
      comment: ['']
    });
    this.id = this.route.snapshot.params?.['id'];
    this.zoneINFI.headerId = Number(this.id);
    this.zoneINFI.zoneType = this.zoneType;
    this.configurarHiddenNumber();
    this.getZonesDamages();

    this.pluginsForm.get('rollerSkates').valueChanges.subscribe(value => {
      if (value !== null && value !== undefined) {
        this.pluginsForm.get('rollerSkates').setValue(String(value), { emitEvent: false });
      }
    });

    this.pluginsForm.get('spike').valueChanges.subscribe(value => {
      if (value !== null && value !== undefined) {
        this.pluginsForm.get('spike').setValue(String(value), { emitEvent: false });
      }
    });
  }

  async getZonesDamages() {

    const adj = this.itemCode == 'TDA' ? 0.015 : this.scale;

    let response = await this.workflowService.getZonesDamages(this.zoneINFI);

    this.module = response.data.headerData.movementType == 'E' ? 'input_inspections' : 'output_inspections';
    this.itemCode = response.data.headerData.itemCode || "default";
    this.spikeList = response.data.espigaType;
    this.rollerSkatesList = response.data.patinesType;

    this.spikeList.forEach((item) => { item.listValueId = item.listValueId.toString(); });
    this.rollerSkatesList.forEach((item) => { item.listValueId = item.listValueId.toString(); });

    if (!!response.data && !!response.data.zoneData) {

      this.pluginsForm.patchValue({
        spike: response.data.zoneData.infEspiga || null,
        rollerSkates: response.data.zoneData.infPatines || null,
        axis1: response.data.zoneData.infEje1,
        axis2: response.data.zoneData.infEje2,
        hiddenNumber: !!response.data.zoneData.infNumeroOcultos ? response.data.zoneData.infNumeroOcultos : 'N',
        comment: response.data.zoneData.infComments
      });

      if (!!response.data.zoneData.danoDetailsJson) {

        this.loadDamage = () => {
          const data = response.data.zoneData.danoDetailsJson;
          this.circles = data.map((point: any) => {
            if (point.r === undefined && point.c === undefined) {
              return {
                ...point,
                x: point.x < 0 ? Math.abs(point.x) : point.x,
                y: point.y < 0 ? Math.abs(point.y) : point.y
              };
            } else if (point.r !== undefined && point.c !== undefined) {
              const pos = this.damagesModal.getPositionFromCell(point.r, point.c, adj);
              return { ...point, x: pos.x, y: pos.y };
            }
            return point;
          });

        }
      }

      this.damageCount = this.circles.length;
    }

    this.getFiles();
  }

  async getFiles() {
    const response = await this.fileService.getFiles(this.module, Number(this.id));

    this.hiddenNumberPhotos = response.data.filter((data) => data.url.includes(`${this.module}/${this.zoneType}/hiddenNumber/`));
    this.generalPhotos = response.data.filter((data) => data.url.includes(`${this.module}/${this.zoneType}/generalPhotos/`));

    this.pluginsForm.patchValue({
      hiddenNumber: this.hiddenNumberPhotos.length > 0 ? 'Y' : 'N'
    })

    this.initialState = this.getCurrentStateSnapshot();
  }

  async savePlugins(force: boolean = false) {

    if (Session.isViewInsp(this.id)) return true;

    if (!this.hasChanges() && !force) return true;

    let loadFiles = false;

    if (this.pluginsForm.value.hiddenNumber === 'Y' && (this.hiddenNumberPhotos.length === 0 && this.hiddenNumberPhotosTemp.length === 0)) {
      this.toastr.error('Debe agregar al menos una foto del número oculto.', 'Error');
      return false;
    }

    if (this.hiddenNumberPhotosTemp.length > 0) {
      await this.fileService.uploadFiles(
        this.module,
        Number(this.id),
        `${this.module}/${this.zoneType}/hiddenNumber/${Number(this.id)}/`,
        this.hiddenNumberPhotosTemp.map(p => p.file)
      );
      this.hiddenNumberPhotosTemp = [];
      loadFiles = true;
    }
    if (this.generalPhotosTemp.length > 0) {
      await this.fileService.uploadFiles(
        this.module,
        Number(this.id),
        `${this.module}/${this.zoneType}/generalPhotos/${Number(this.id)}/`,
        this.generalPhotosTemp.map(p => p.file)
      );
      this.generalPhotosTemp = [];
      loadFiles = true;
    }

    if (this.hasgChangesCircles()) captureImage("INF", this.id, this.fileService);

    if (loadFiles) {
      await this.getFiles();
    }

    this.zoneINFI.espigaType = this.pluginsForm.value.spike;
    this.zoneINFI.patinesType = this.pluginsForm.value.rollerSkates;
    this.zoneINFI.eje1 = this.pluginsForm.value.axis1;
    this.zoneINFI.eje2 = this.pluginsForm.value.axis2;
    this.zoneINFI.numeroOcultos = this.pluginsForm.value.hiddenNumber;
    this.zoneINFI.comments = this.pluginsForm.value.comment;
    this.zoneINFI.allDanos = this.circles;

    let response = await this.workflowService.patchZonesDamages(this.zoneINFI);
    this.initialState = this.getCurrentStateSnapshot();

    if (!!response.data) {
      this.toastr.success('Guardado correcto de la información.', 'Éxito');
      return true;
    } else {
      this.toastr.error(response.error.error.error, 'Error');
      return false;
    }

  }

  async updateDamageStatus(status: string) {
    if (this.damageStatus === status) {
      this.damageStatus = '';
      this.active2 = '';
    } else {
      this.damageStatus = status;
    }
  }

  scale = 0.024; // Ajuste basado en el 5% del ancho del elemento

  async addDamage(event: MouseEvent) {
    if (!this.damageStatus) {
      return; // No hacer nada si no hay un tipo de daño seleccionado
    }

    const adj = this.itemCode == 'TDA' ? 0.015 : this.scale;

    const cell = this.damagesModal.getCellFromEvent(event, adj);
    const padding = 3; // Ajusta este valor según tus necesidades

    // Invertir la condición: si no está dentro de los límites, retornar
    if (cell.x + cell.a < 0 || cell.y + cell.a < 0 || cell.x > cell.w - padding || cell.y > cell.h - padding) {
      return;
    }

    const color = this.damagesModal.getColor(cell.x, cell.y, cell.w, cell.h, cell.e);
    if (color == 'rgb(255, 255, 255)') {
      return; // Si el color es blanco, no hacer nada
    }

    let max = this.circles.length == 0 ? 1 : Math.max(...this.circles.map((i) => i.dano_order));

    let danioI = this.damagesModal.getInitDanoI();

    danioI.id = max + 1;
    danioI.zone_type = this.zoneType;
    danioI.dano_order = max + 1;
    danioI.header_id = this.id;
    danioI.x = cell.x;
    danioI.y = cell.y;
    danioI.r = cell.r;
    danioI.c = cell.c;
    danioI.recordExist = false;

    if (this.damageStatus == 'SECCIONADO') {
      danioI.dano_type = 'Z';
    } else {
      danioI.dano_type = this.damageStatus.charAt(0);
    }

    this.circles.push(danioI);

    // Incrementar el contador de daños
    this.damageCount = this.circles.length;
    this.changes = true;
  }

  async addPhotos(event: any, index: number | string) {
    const files: File[] = Array.from(event.target.files as FileList);

    if (index === 'hiddenNumber') {
      this.hiddenNumberPhotosTemp.push(...files.map(file => ({
        file,
        url: URL.createObjectURL(file)
      })))
    } else if (index === 'generalPhotos') {
      this.generalPhotosTemp.push(...files.map(file => ({
        file,
        url: URL.createObjectURL(file)
      })))
    }
    event.target.value = '';
  }

  async removePhoto(index: number | string, photoIndex: number) {
    if (
      await Alert.question(
        'Eliminar Foto',
        '<p>¿Desea eliminar la foto de manera <strong>"PERMANENTE"</strong>?</p>'
      )
    ) {
      if (index === 'hiddenNumber') {
        let deleteFile = { ids: [this.hiddenNumberPhotos[photoIndex].idFile] };
        await this.fileService.deleteFile(deleteFile);
        this.hiddenNumberPhotos.splice(photoIndex, 1);
      } else if (index === 'generalPhotos') {
        let deleteFile = { ids: [this.generalPhotos[photoIndex].idFile] };
        await this.fileService.deleteFile(deleteFile);
        this.generalPhotos.splice(photoIndex, 1);
      }
    }
  }

  /* DAMAGESMODAL */
  async openDamagesModal(danioI: DanioI, event: any, doble: boolean = false) {
    event.stopPropagation(); // Evita que el evento se propague al contenedor padre

    // Solo validamos damageStatus si estamos agregando un nuevo daño
    if (this.damageStatus && !doble && !danioI.recordExist) {
      return;
    }

    const imgElement = document.querySelector('#img-container');
    this.damagesModal.openDamagesModal(this.id, danioI, this.itemCode, imgElement, this.scale);
  }

  async removeDamage(circleId: number) {

    this.changes = true;
    // Eliminar el círculo de la lista de círculos
    this.circles = this.circles.filter((circle) => circle.id !== circleId);

    // Decrementar el contador de daños
    this.damageCount = this.circles.length;

    await this.savePlugins(true);
  }

  configurarHiddenNumber(): void {
    this.hiddenNumberStateService.selectedTab$.subscribe((tab) => {
      const yoSoy = this.zoneType;
      const yaEstaActivo = !!tab && tab !== yoSoy;

      this.disableHiddenNumber = yaEstaActivo;

      const control = this.pluginsForm.get('hiddenNumber');
      if (yaEstaActivo) {
        control?.disable({ emitEvent: false });
      } else {
        control?.enable({ emitEvent: false });
      }
    });

    this.pluginsForm.get('hiddenNumber')?.valueChanges.subscribe((value) => {
      const yoSoy = this.zoneType;

      if (value === 'Y') {
        this.hiddenNumberStateService.setSelectedTab(yoSoy);
      }

      if (value === 'N' && this.hiddenNumberStateService.getSelectedTab() === yoSoy) {
        this.hiddenNumberStateService.setSelectedTab(null);
      }
    });
  }

  clearField(fieldProp: string): void {
    this.pluginsForm.patchValue({ [fieldProp]: '' });
  }

  getClearField(prop): any {
    return this.pluginsForm.value[prop];
  }

  private initialState: any;

  private getCurrentStateSnapshot() {
    return JSON.stringify({
      image2: this.hiddenNumberPhotosTemp.length,
      image3: this.generalPhotosTemp.length,
      form: this.pluginsForm.value,
      circles: this.circles
    });
  }

  hasChanges(): boolean {
    const current = this.getCurrentStateSnapshot();
    return current !== this.initialState;
  }

  hasgChangesCircles(): boolean {
    const circls = JSON.parse(this.initialState).circles;
    return JSON.stringify(this.circles) !== JSON.stringify(circls);
  }

  async removePhotoTemp(index: number | string, photoIndex: number) {
    if (
      await Alert.question(
        'Eliminar Foto',
        '<p>¿Desea eliminar la foto de manera <strong>"PERMANENTE"</strong>?</p>'
      )
    ) {
      if (index === 'hiddenNumber') {
        this.hiddenNumberPhotosTemp.splice(photoIndex, 1);
      } else if (index === 'generalPhotos') {
        this.generalPhotosTemp.splice(photoIndex, 1);
      }
    }
  }

  confirmDamage(danio: any) {

    if (danio) {
      const circle = this.circles.find(d => d.c === danio.c && d.r === danio.r
        && d.dano_order === danio.danoOrder
        && d.dano_type === danio.danoType);
      circle.recordExist = true;
    }

    this.savePlugins(true);
  }
}
