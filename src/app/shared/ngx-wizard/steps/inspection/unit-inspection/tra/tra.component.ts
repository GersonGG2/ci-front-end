import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkflowService } from 'src/app/shared/ngx-wizard/workflow/workflow.service';
import { DanioI, ZoneTRAI } from 'src/app/shared/ngx-wizard/workflow/workflow.model';

import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DamagesModalComponent } from 'src/app/shared/ngx-wizard/damages-modal/damages-modal.component';
import { FileService } from 'src/app/shared/services/file.service';
import { Alert } from 'src/app/helpers/alerts';
import { HiddenNumberStateService } from '../hidden-number-state.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ImgRetryComponent } from 'src/app/shared/img-retry.component';
import { Session } from 'src/app/helpers/session.service';
import { captureImage } from '../unit-inspection.component';

@Component({
  selector: 'app-tra',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbNavModule, DamagesModalComponent, NgSelectComponent, ImgRetryComponent],
  templateUrl: './tra.component.html',
  styleUrls: ['../unit-inspection.component.scss']
})
export class TraComponent implements OnInit {
  id = '';
  itemCode = '';
  doorTypesList: any[] = [];

  pluginsForm = this.fb.group({
    doorType: [null],
    circulationPlate: ['N'],
    plate: [''],
    vinPlate: ['N'],
    hiddenNumber: ['N'],
    comment: ['']
  });

  damageStatus = '';
  damageCount = 0; // Contador de daños
  circles: any[] = [];

  active2 = 'top';

  platePhotos: any[] = [];
  plateVinPhotos: any[] = [];
  hiddenNumberPhotos: any[] = [];
  generalPhotos: any[] = [];
  platePhotosTem: any[] = [];
  plateVinPhotosTemp: any[] = [];
  hiddenNumberPhotosTemp: any[] = [];
  generalPhotosTemp: any[] = [];

  module = '';
  zoneType = 'TRA';

  zoneTRAI = {} as ZoneTRAI;

  disableHiddenNumber = false;
  changes = false;
  loadDamage = () => { }

  doorTypeList = [
    { label: 'ABATIBLE', value: 'ABATIBLE' },
    { label: 'CORTINA', value: 'CORTINA' }
  ];

  /* DAMAGESMODAL */
  @ViewChild('damagesModal', { static: true }) damagesModal: DamagesModalComponent;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private workflowService: WorkflowService,
    private toastr: ToastrService,
    private fileService: FileService,
    private hiddenNumberStateService: HiddenNumberStateService
  ) { }

  async ngOnInit() {
    this.id = this.route.snapshot.params?.['id'];
    this.zoneTRAI.headerId = Number(this.id);
    this.zoneTRAI.zoneType = this.zoneType;
    this.configurarHiddenNumber();
    this.getZonesDamages();
    this.getZonesDamagesInt();
  }

  async getZonesDamages() {

    const adj = this.itemCode == 'TDA' ? 0.015 : 0.06;

    let response = await this.workflowService.getZonesDamages(this.zoneTRAI);

    this.module = response.data.headerData.movementType == 'E' ? 'input_inspections' : 'output_inspections';
    this.itemCode = response.data.headerData.itemCode || "default";;
    this.doorTypesList = response.data.rearType;

    if (!!response.data && !!response.data.zoneData) {

      this.changeImege(response.data.zoneData.traRearType);

      this.pluginsForm.patchValue({
        doorType: response.data.zoneData.traRearType || null,
        circulationPlate: !!response.data.zoneData.traPlacaCirculacion ? response.data.zoneData.traPlacaCirculacion : 'N',
        plate: response.data.zoneData.traPlaca,
        vinPlate: !!response.data.zoneData.traPlacaDeVin ? response.data.zoneData.traPlacaDeVin : 'N',
        hiddenNumber: !!response.data.zoneData.traNumeroOcultos ? response.data.zoneData.traNumeroOcultos : 'N',
        comment: response.data.zoneData.traComments
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
    } else {
      this.pluginsForm.patchValue({ doorType: 'ABATIBLE' });
    }

    this.getFiles();
  }

  damageInt = {
    hiddenNumber: '',
    comment: '',
    damageCount: 0
  }

  async getZonesDamagesInt() {

    const zoneTRAIN = {
      headerId: Number(this.id),
      zoneType: 'INT'
    };

    let response = await this.workflowService.getZonesDamages(zoneTRAIN);

    if (!!response.data && !!response.data.zoneData) {
    }

    this.damageInt.hiddenNumber = !!response.data.zoneData?.intNumeroOcultos ? response.data.zoneData?.intNumeroOcultos : 'N',
      this.damageInt.comment = response.data.zoneData?.intObservacions

    if (!!response.data && !!response.data.zoneData) {
      if (!!response.data.zoneData.danoDetailsJson &&
        response.data.zoneData.danoDetailsJson.length > 0
      ) {
        this.damageInt.damageCount = response.data.zoneData.danoDetailsJson.length;
      }
    }

  }

  async getFiles() {
    const response = await this.fileService.getFiles(this.module, Number(this.id));

    this.platePhotos = response.data.filter((data) => data.url.includes(`${this.module}/${this.zoneType}/plate/`));
    this.plateVinPhotos = response.data.filter((data) => data.url.includes(`${this.module}/${this.zoneType}/plateVin/`));
    this.hiddenNumberPhotos = response.data.filter((data) => data.url.includes(`${this.module}/${this.zoneType}/hiddenNumber/`));
    this.generalPhotos = response.data.filter((data) => data.url.includes(`${this.module}/${this.zoneType}/generalPhotos/`));

    this.pluginsForm.patchValue({
      circulationPlate: this.platePhotos.length > 0 ? 'Y' : 'N',
      vinPlate: this.plateVinPhotos.length > 0 ? 'Y' : 'N',
      hiddenNumber: this.hiddenNumberPhotos.length > 0 ? 'Y' : 'N'
    })

    this.initialState = this.getCurrentStateSnapshot();
  }

  async savePlugins(force: boolean = false) {

    if (Session.isViewInsp(this.id)) return true;

    if (!this.hasChanges() && !force) return true;

    let loadFiles = false;

    if (this.pluginsForm.value.vinPlate === 'Y' && (this.plateVinPhotos.length === 0 && this.plateVinPhotosTemp.length === 0)) {
      this.toastr.error('Debe agregar al menos una foto de la placa VIN.', 'Error');
      return false;
    }

    if (this.platePhotosTem.length > 0) {
      await this.fileService.uploadFiles(
        this.module,
        Number(this.id),
        `${this.module}/${this.zoneType}/platePhotos/${Number(this.id)}/`,
        this.platePhotosTem.map(p => p.file)
      );
      this.platePhotosTem = [];
      loadFiles = true;
    }

    if (this.plateVinPhotosTemp.length > 0) {
      await this.fileService.uploadFiles(
        this.module,
        Number(this.id),
        `${this.module}/${this.zoneType}/plateVin/${Number(this.id)}/`,
        this.plateVinPhotosTemp.map(p => p.file)
      );
      this.plateVinPhotosTemp = [];
      loadFiles = true
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
      loadFiles = true
    }

    if (this.hasgChangesCircles()) captureImage("TRA", this.id, this.fileService);

    if (loadFiles) {
      await this.getFiles();
    }


    this.zoneTRAI.rearType = this.pluginsForm.value.doorType;
    this.zoneTRAI.placaCirculacion = this.pluginsForm.value.circulationPlate;
    this.zoneTRAI.placa = this.pluginsForm.value.plate;
    this.zoneTRAI.placaDeVin = this.pluginsForm.value.vinPlate;
    this.zoneTRAI.numeroOcultos = this.pluginsForm.value.hiddenNumber;
    this.zoneTRAI.comments = this.pluginsForm.value.comment;
    this.zoneTRAI.allDanos = this.circles;

    let response = await this.workflowService.patchZonesDamages(this.zoneTRAI);
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
      //await this.savePlugins();
    } else {
      this.damageStatus = status;
    }
  }

  async addDamage(event: MouseEvent) {

    if (!this.damageStatus) {
      return; // No hacer nada si no hay un tipo de daño seleccionado
    }

    const adj = this.itemCode == 'TDA' ? 0.015 : 0.06;

    const cell = this.damagesModal.getCellFromEvent(event, adj);
    const padding = 3; // Ajusta este valor según tus necesidades

    // Invertir la condición: si no está dentro de los límites, retornar
    if (
      cell.x + cell.a < 0 ||
      cell.y + cell.a < 0 ||
      cell.x > cell.w - padding ||
      cell.y > cell.h - padding
    ) {
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
    const files: File[] = Array.from(event.target.files as FileList)

    console.log(index)
    if (index === 'plate') {
      this.platePhotosTem.push(...files.map(file => ({
        file,
        url: URL.createObjectURL(file)
      })))
    } else if (index === 'plateVin') {
      this.plateVinPhotosTemp.push(...files.map(file => ({
        file,
        url: URL.createObjectURL(file)
      })))
    } else if (index === 'hiddenNumber') {
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
      if (index === 'plate') {
        let deleteFile = { ids: [this.platePhotos[photoIndex].idFile] };
        await this.fileService.deleteFile(deleteFile);
        this.platePhotos.splice(photoIndex, 1);
      } else if (index === 'plateVin') {
        let deleteFile = { ids: [this.plateVinPhotos[photoIndex].idFile] };
        await this.fileService.deleteFile(deleteFile);
        this.plateVinPhotos.splice(photoIndex, 1);
      } else if (index === 'hiddenNumber') {
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

  image = 'TRA';

  async changeDoorType() {
    let doorType = this.pluginsForm.value.doorType;
    if (this.circles.length > 0 || this.damageInt.damageCount > 0) {
      if (await Alert.question('Advertencia', '<p>Al continuar, los formularios TRA, INT se reestablecerán.</p>')) {

        this.changeImege();

        this.pluginsForm.patchValue({
          circulationPlate: 'N',
          plate: '',
          vinPlate: 'N',
          hiddenNumber: 'N',
          comment: ''
        });

        this.circles = [];
        await this.savePluginsInt()
        await this.savePlugins(true);
      } else {
        this.pluginsForm.patchValue({ doorType: doorType == 'ABATIBLE' ? 'CORTINA' : 'ABATIBLE' });
      }
    } else {
      this.changeImege();
    }
  }

  changeImege(doorType = null) {
    if (!doorType) doorType = this.pluginsForm.value.doorType;
    this.image = 'TRA';
    if (this.itemCode != 'TDA')
      this.image = doorType == 'ABATIBLE' ? 'TRA' : 'TRA_CORTINA';
  }

  async savePluginsInt() {

    const zoneINTI = {
      headerId: Number(this.id),
      zoneType: 'INT',
      numeroOcultos: "N",
      observacions: "",
      allDanos: []
    };

    await this.workflowService.patchZonesDamages(zoneINTI);

  }



  /* DAMAGESMODAL */
  async openDamagesModal(danioI: DanioI, event: any, doble: boolean = false) {
    event.stopPropagation(); // Evita que el evento se propague al contenedor padre

    // Solo validamos damageStatus si estamos agregando un nuevo daño
    if (this.damageStatus && !doble && !danioI.recordExist) {
      return;
    }

    const imgElement = document.querySelector('#img-container');
    this.damagesModal.openDamagesModal(this.id, danioI, this.itemCode, imgElement);
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
    this.hiddenNumberStateService.selectedTab$.subscribe(tab => {
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

    this.pluginsForm.get('hiddenNumber')?.valueChanges.subscribe(value => {
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
      image1: this.plateVinPhotosTemp.length,
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
    if (await Alert.question('Eliminar Foto', '<p>¿Desea eliminar la foto de manera <strong>"PERMANENTE"</strong>?</p>')) {
      if (index === 'plate') {
        this.platePhotosTem.splice(photoIndex, 1)
      } else if (index === 'plateVin') {
        this.plateVinPhotosTemp.splice(photoIndex, 1)
      } else if (index === 'hiddenNumber') {
        this.hiddenNumberPhotosTemp.splice(photoIndex, 1)
      } else if (index === 'generalPhotos') {
        this.generalPhotosTemp.splice(photoIndex, 1)
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
