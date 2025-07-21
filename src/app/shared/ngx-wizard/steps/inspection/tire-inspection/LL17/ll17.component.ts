import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WorkflowService } from 'src/app/shared/ngx-wizard/workflow/workflow.service';
import { DanioI, ZoneLLI } from 'src/app/shared/ngx-wizard/workflow/workflow.model';

import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DamagesTiresModalComponent } from 'src/app/shared/ngx-wizard/damages-tires-modal/damages-tires-modal.component';
import { FileService } from 'src/app/shared/services/file.service';
import { Alert } from 'src/app/helpers/alerts';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-ll17',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbNavModule, DamagesTiresModalComponent, NgSelectComponent],
  templateUrl: './ll17.component.html',
  styleUrls: ['../tire-inspection.component.scss']
})
export class LL17Component implements OnInit {
  id = '';
  typeList: any[] = [];
  dotList: any[] = [];
  brandList: any[] = [];
  modelList: any[] = [];
  measurementList: any[] = [];
  renewedList: any[] = [];
  conditionList: any[] = [];

  pluginsForm = this.fb.group({
    type: [null, [Validators.required]],
    eco: [null, [Validators.required]],
    dot: [null, [Validators.required]],
    brand: [null, [Validators.required]],
    model: [null, [Validators.required]],
    measurement: [null, [Validators.required]],
    renewed: [null, [Validators.required]],
    min: [null, [Validators.required, Validators.min(1), Validators.max(32)]], // Validaciones para min
    max: [null, [Validators.required, Validators.min(1), Validators.max(32)]], // Validaciones para max  
    condition: [null],
    comment: [null]
  });

  damageStatus = '';
  damageCount = 0; // Contador de daños
  circles: any[] = [];

  active2 = 'top';

  generalPhotos: any[] = []; // Definir la propiedad generalPhotos

  module = '';
  zoneType = 'LL17';
  itemCode = 'LL17';
  changes = false;
  changesForm = false;

  zoneLLI = {} as ZoneLLI;

  renewedOptions = [
    { meaning: 'Sí', listValue: 'si' },
    { meaning: 'No', listValue: 'no' }
  ];

  /* DAMAGESMODAL */
  @ViewChild('damagesModal', { static: true }) damagesModal: DamagesTiresModalComponent;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private workflowService: WorkflowService,
    private toastr: ToastrService,
    private fileService: FileService
  ) { }

  async ngOnInit() {
    this.id = this.route.snapshot.params?.['id'];
    this.zoneLLI.headerId = Number(this.id);
    this.zoneLLI.zoneType = this.zoneType;
    this.getZonesDamages();

    this.pluginsForm.valueChanges.subscribe((changes) => {
      this.changesForm = true;
    });
  }

  async getZonesDamages() {
    let response = await this.workflowService.getZonesDamages(this.zoneLLI);

    this.module = response.data.headerData.movementType == 'E' ? 'input_inspections' : 'output_inspections';

    this.typeList = response.data.insTipo;
    this.dotList = response.data.insDot;
    this.brandList = response.data.insMarca;
    this.modelList = response.data.insModelo;
    this.measurementList = response.data.insMedidas;
    this.renewedList = response.data.insRenovados;
    this.conditionList = response.data.insCondicion;

    if (!!response.data && !!response.data.zoneData) {
      this.pluginsForm.patchValue({
        type: response.data.zoneData.insTipo || null,
        eco: response.data.zoneData.insEco,
        dot: response.data.zoneData.insDot,
        brand: response.data.zoneData.insMarca || null,
        model: response.data.zoneData.insModelo,
        measurement: response.data.zoneData.insMedidas || null,
        renewed: response.data.zoneData.insRenovados || null,
        min: response.data.zoneData.val_1_32_1,
        max: response.data.zoneData.val_1_32_2,
        condition: response.data.zoneData.insCondicion || null,
        comment: response.data.zoneData.insComments
      });

      this.changesForm = false;
      if (!!response.data.zoneData.danoDetailsJson) {
        this.circles = response.data.zoneData.danoDetailsJson;
      }

      this.damageCount = this.circles.length;
    }

    this.getFiles();
  }

  async getFiles() {
    const response = await this.fileService.getFiles(this.module, Number(this.id));

    this.generalPhotos = response.data.filter((data) => data.url.includes(`${this.module}/${this.zoneType}/generalPhotos/`));
  }

  async savePlugins() {
    this.zoneLLI.insTipo = this.pluginsForm.value.type;
    this.zoneLLI.insEco = this.pluginsForm.value.eco;
    this.zoneLLI.insDot = String(this.pluginsForm.value.dot ?? "");
    this.zoneLLI.insMarca = this.pluginsForm.value.brand;
    this.zoneLLI.insModelo = this.pluginsForm.value.model;
    this.zoneLLI.insMedidas = this.pluginsForm.value.measurement;
    this.zoneLLI.insRenovados = this.pluginsForm.value.renewed;
    this.zoneLLI.val1321 = this.pluginsForm.value.min;
    this.zoneLLI.val1322 = this.pluginsForm.value.max;
    this.zoneLLI.insCondicion = this.pluginsForm.value.condition;
    this.zoneLLI.comments = this.pluginsForm.value.comment;

    this.zoneLLI.allDanos = this.circles;

    let response = await this.workflowService.patchZonesDamages(this.zoneLLI);

    if (this.changes) {
      if (!!response.data) {
        this.toastr.success('Guardado correcto de la información.', 'Éxito');
      } else {
        this.toastr.error(response.error.error.error, 'Error');
      }
    }

    return this.changes;
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

    const adj = 0.025;
    //this.itemCode == 'TDA' ? 0.015 : 0.06;

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
    let danioI = {} as DanioI;

    danioI.id = max + 1;
    danioI.zone_type = this.zoneType;
    danioI.dano_type = this.damageStatus.charAt(0);
    danioI.dano_order = max + 1;
    danioI.header_id = this.id;
    danioI.x = cell.x;
    danioI.y = cell.y;
    danioI.r = cell.r;
    danioI.c = cell.c;
    danioI.recordExist = false;

    this.circles.push(danioI);

    // Incrementar el contador de daños
    this.damageCount = this.circles.length;
    this.changes = true;
  }

  async addPhotos(event: any, index: number | string) {
    const files = event.target.files;

    this.fileService
      .uploadFiles(this.module, Number(this.id), `${this.module}/${this.zoneType}/${index}/${Number(this.id)}/`, files)
      .then((response) => {
        this.getFiles();
      })
      .catch((error) => {
      });
  }

  async removePhoto(index: number | string, photoIndex: number) {

    if (
      await Alert.question(
        'Eliminar Foto',
        '<p>¿Desea eliminar la foto de manera <strong>"PERMANENTE"</strong>?</p>'
      )
    ) {
      if (index === 'generalPhotos') {
        let deleteFile = { ids: [this.generalPhotos[photoIndex].idFile] };
        await this.fileService.deleteFile(deleteFile);
        this.generalPhotos.splice(photoIndex, 1);
      }
    }
  }

  async openDamagesModal(danioI: DanioI, event: any, doble: boolean = false) {

    event.stopPropagation(); // Evita que el evento se propague al contenedor padre

    if (this.damageStatus && !doble) {
      return;
    }

    if (this.damageStatus && doble) {
      //this.savePlugins();
    }

    this.damagesModal.openDamagesModal(this.id, danioI, this.itemCode);
  }

  async removeDamage(circleId: number) {

    this.changes = true;

    // Eliminar el círculo de la lista de círculos
    this.circles = this.circles.filter((circle) => circle.id !== circleId);

    // Decrementar el contador de daños
    this.damageCount = this.circles.length;

    await this.savePlugins();
  }

  async findByEcoNumber() {
    let filter = { ecoNumber: this.pluginsForm.value.eco || '' };
    let response = await this.workflowService.getEcoTire(filter);
    if (!!response.data) {
      this.pluginsForm.patchValue({
        type: response.data.tipo,
        eco: response.data.eco,
        dot: response.data.dot,
        //brand: response.data.insMarca,
        model: response.data.modelo,
        measurement: response.data.medidas,
        //renewed: response.data.renovados,
        min: response.data.val_1_32_1,
        max: response.data.val_1_32_2,
        //condition: response.data.condicion,
        comment: response.data.comments
      });
    }
  }

  clearField(fieldProp: string): void {
    this.pluginsForm.get(fieldProp)?.markAsTouched();
    this.pluginsForm.get(fieldProp)?.markAsDirty();
    this.pluginsForm.patchValue({ [fieldProp]: '' });
  }

  getClearField(prop): any {
    return this.pluginsForm.value[prop];
  }

  isError(field: string): boolean {

    return this.pluginsForm.get(field)?.hasError('required') &&
      this.pluginsForm.get(field)?.invalid &&
      this.pluginsForm.get(field)?.touched;
  }

  isChangeForm(): boolean {

    if (this.changesForm && this.pluginsForm.invalid) {
      this.pluginsForm.markAllAsTouched();
    }
    
    return this.changesForm;
  }

}
