import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WorkflowService } from '../workflow/workflow.service';
import { DamageDetailI, DanioI, EntryI, SysSelectLovI } from '../workflow/workflow.model';
import { GenericTableComponent } from 'src/app/features/component/generic-table/generictable.component';
import { GenericSelectorComponent } from 'src/app/features/component/generic-selector/genericselector.component';
import { FileService } from 'src/app/shared/services/file.service';
import { Alert } from 'src/app/helpers/alerts';
import imgDetails from 'src/app/json/img_details.json';
import imageCompression from 'browser-image-compression';
import { Session } from 'src/app/helpers/session.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ImgRetryComponent } from '../../img-retry.component';

@Component({
  selector: 'app-damages-tires-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbPaginationModule, GenericTableComponent, NgSelectComponent, ImgRetryComponent],
  templateUrl: './damages-tires-modal.component.html',
  styleUrl: './damages-tires-modal.component.scss'
})
export class DamagesTiresModalComponent {
  @ViewChild('content', { static: true }) content: any;

  id = '';

  damagesModalRef: NgbModalRef;

  currentCircle: DanioI;

  damageForm = this.fb.group({
    activities: this.fb.array([])
  });

  get activities(): FormArray {
    return this.damageForm.get('activities') as FormArray;
  }

  faultListModal: any[] = [];
  damageConditionsListModal: any[] = [];

  itemCode = '';

  index: number;

  module = '';
  loadDanioI: any = {};

  @Output() damageEvent = new EventEmitter<number>();
  @Output() reloadEvent = new EventEmitter<any>();

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private workflowService: WorkflowService,
    private toastr: ToastrService,
    private fileService: FileService
  ) { }

  async openDamagesModal(id: string, danioI: DanioI, itemCode: string) {

    this.id = id;
    this.loadDanioI = danioI;
    this.loadDanioI.itemCode = itemCode;


    this.currentCircle = danioI;
    this.activities.clear();
    let response = await this.workflowService.getDetailDamages(danioI);

    if (!!response.data) {
      this.module = response.data.data.currentData.movementType == 'E' ? 'input_inspections_detail' : 'output_inspections_detail';
      this.faultListModal = response.data.data.falla;
      this.damageConditionsListModal = response.data.data.danoConditions;
      this.itemCode = response.data.data.currentData.itemCode;

      let data = imgDetails.GRID[itemCode];
      if (!data) data = imgDetails.GRID[danioI.zone_type];





      const files = await this.fileService.getFiles(this.module, Number(this.id));
      if (!!response.data.data.entries && response.data.data.entries.length > 0) {
        response.data.data.entries.forEach((item: any, index: number) => {
          const activityForm = this.fb.group({
            detailId: [item.detailId],
            condition: [Number(item.category), Validators.required],
            activity: [!!item.material ? item.material.itemCode + '-' + item.material.itemDescription : '', Validators.required],
            activityAll: [item.material],
            fault: [Number(item.falla), Validators.required],
            quantity: [item.cant, Validators.required],
            comments: [item.comments],
            photos: this.fb.array([]),
            files: this.fb.array([])
          });

          const photos = activityForm.get('photos') as FormArray;
          let array = files.data.filter((data) =>
            data.url.includes(`${this.module}/${this.currentCircle.zone_type}/${Number(this.id)}/${item.detailId}/`)
          );

          array.forEach((element) => {
            photos.push(this.fb.control(element));
          });

          this.activities.push(activityForm);
        });
      } else {
        this.addActivity();
      }
    } else {
      this.toastr.error(response.error.error.error, 'Error');
    }
    this.damagesModalRef = this.modalService.open(this.content, { size: 'lg' }); // Cambia 'lg' a 'sm' o 'xl' según sea necesario
  }

  addActivity(): void {
    const activityForm = this.fb.group({
      condition: ['', Validators.required],
      activity: ['', Validators.required],
      activityAll: [''],
      fault: ['', Validators.required],
      quantity: ['', Validators.required],
      comments: [''],
      photos: this.fb.array([]),
      files: this.fb.array([])
    });

    this.activities.push(activityForm);
  }

  async addPhotos(event: Event, index: number | string): Promise<void> {
    try {
      // 1. Mejor tipado para el event y files
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;

      // 2. Procesar archivos en secuencia para evitar sobrecarga
      for (const file of Array.from(input.files)) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1280,
            initialQuality: 0.8,
            fileType: 'image/jpeg',
            alwaysKeepResolution: false
          };

          // 3. Comprimir imagen
          const compressedBlob = await imageCompression(file, options);

          const compressedFile = new File(
            [compressedBlob],
            file.name, // 🚀 Mantenemos el nombre original
            { type: compressedBlob.type }
          );

          // 4. Leer como DataURL (convertir a promesa para mejor manejo)
          const readerResult = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
          });

          // 5. Actualizar formulario
          if (typeof index === 'number') {
            const activity = this.activities.at(index) as FormGroup;

            // Photos (previews como DataURL)
            const photos = activity.get('photos') as FormArray;
            photos.push(this.fb.control(readerResult));

            // Files (archivos comprimidos)
            const files = activity.get('files') as FormArray;
            files.push(this.fb.control(compressedFile));
          }
        } catch (error) {
          console.error('Error procesando archivo:', file.name, error);
          // Podrías mostrar un mensaje al usuario aquí
        }
      }

      input.value = ''; // Limpiar el input después de procesar los archivos

    } catch (error) {
      console.error('Error general en addPhotos:', error);
    }
  }

  async removePhoto(index: number | string, photoIndex: number) {

    if (Session.isViewInsp(this.id)) return;

    if (await Alert.question('Eliminar Foto', '<p>¿Desea eliminar la foto de manera <strong>"PERMANENTE"</strong>?</p>')) {
      if (typeof index === 'number') {
        const activity = this.activities.at(index) as FormGroup;
        const photos = activity.get('photos') as FormArray;
        const files = activity.get('files') as FormArray;
        const diff = photos.value.length - files.value.length;
        const fileIndex = photoIndex - diff;
        if (!files.value[fileIndex]) {
          let deleteFile = {
            ids: [photos.value[photoIndex].idFile]
          };
          let response = await this.fileService.deleteFile(deleteFile);
        }
        photos.removeAt(photoIndex);
        files.removeAt(fileIndex);
      }
    }
  }

  deleteActivities = [];
  removeActivity(index: number, removeActivity: any): void {
    removeActivity = removeActivity.value;
    this.deleteActivities.push({
      id: removeActivity.detailId,
      zoneId: removeActivity.zone,
    });
    this.activities.removeAt(index);
  }

  removeDamage(circleId: number) {
    this.damageEvent.emit(circleId);
  }

  async saveDamageDetail() {

    if (Session.isViewInsp(this.id)) return;

    if (this.damageForm.invalid) {
      this.toastr.warning('Faltan datos que son requeridos.', 'Advertencia');
      return;
    }

    let damageDetailI = {} as DamageDetailI;
    damageDetailI.imgZoneDano = '';

    damageDetailI.detail = {} as any;
    damageDetailI.detail.danoOrder = this.currentCircle.dano_order;
    damageDetailI.detail.danoType = this.currentCircle.dano_type;
    damageDetailI.detail.headerId = Number(this.currentCircle.header_id);
    damageDetailI.detail.x = this.currentCircle.x;
    damageDetailI.detail.y = this.currentCircle.y;
    damageDetailI.detail.zoneType = this.currentCircle.zone_type;

    let entries: EntryI[] = [];

    this.activities.value.forEach((element: any, index: number) => {
      let entryI = {} as EntryI;

      entryI.failure = {} as any;
      entryI.serial = {} as any;
      entryI.zone = {} as any;

      if (!!element.detailId) {
        entryI.id = element.detailId;
      }

      entryI.quantity = element.quantity;
      entryI.comments = element.comments;

      entryI.failure.id = element.fault;

      entryI.serial.code = element.activityAll.itemCode;
      entryI.serial.description = element.activityAll.itemDescription;
      entryI.serial.assemblyItemId = element.activityAll.assemblyItemId;
      entryI.serial.workforce = element.activityAll.workforce;

      entryI.danoCondition = element.condition;

      entries.push(entryI);
    });

    damageDetailI.entries = entries;
    damageDetailI.deletedEntries = this.deleteActivities;

    let response = await this.workflowService.patchDetailDamages(damageDetailI, this.id);

    if (!!response.data) {
      let detailIds = response.data.data.detailIds;

      // Obtener datos básicos para el nombre de archivo
      const moduleName = this.module.includes('input') ? 'Inspeccion' : 'Liberacion';
      const serialNumber = response.data.data.serialNumber || this.id; // Usar serialNumber de la respuesta o el ID

      this.activities.value.forEach(async (element: any, index: number) => {
        if (element.files.length > 0) {
          // Crear archivos con nuevos nombres
          const renamedFiles = element.files.map((file, fileIndex) => {
            const extension = file.name.split('.').pop();
            const newFileName = `${moduleName}_${serialNumber}_${this.currentCircle.zone_type}_${this.currentCircle.dano_type}_${detailIds[index]}_${fileIndex}.${extension}`;
            return new File([file], newFileName, { type: file.type });
          });

          // Usar los archivos renombrados
          await this.fileService
            .uploadFiles(
              this.module,
              Number(this.id),
              `${this.module}/${this.currentCircle.zone_type}/${Number(this.id)}/${detailIds[index]}/`,
              renamedFiles
            );
        }
      });
      this.reloadEvent.emit();
      //this.toastr.success('Guardado correcto de la información.', 'Éxito');
      this.damagesModalRef.close();
    } else {
      this.toastr.error(response.error.error.message, 'Error');
    }
  }

  activitiesColumns = [
    { prop: 'itemCode', name: 'CÓDIGO', filter: false },
    { prop: 'itemDescription', name: 'DESCRIPCIÓN', filter: false },
    { prop: 'workforce', name: 'MO', filter: false }
  ];

  async loadZonesDamages(filter: any = {}) {
    let sysSelectLovI = {} as SysSelectLovI;
    sysSelectLovI.params = {} as any;
    sysSelectLovI.otherParams = {} as any;

    sysSelectLovI.module = 'lov_materials_zones';
    sysSelectLovI.params = filter;

    sysSelectLovI.otherParams.zoneType = 'ALL';
    sysSelectLovI.otherParams.zoneName = 'LLANTAS';

    let response = await this.workflowService.postZonesDamages(sysSelectLovI);

    return response.data;
  }

  itemSelected: any = {};
  modalActivity = false;
  async openActivitiesModalPage(i) {
    this.modalActivity = true;

    this.index = i;

    let form = this.activities.at(i) as FormGroup;

    let split = form.value.activity.split('-');

    let searchCode = form.value.activity;
    if (!!split && split.length > 0) {
      searchCode = split[0];
    }

    let filter = { searchValue: searchCode || '' };

    if (this.itemSelected.itemCode == searchCode) {
      // filter.searchValue = '';
    }

    let response = await this.loadZonesDamages(filter);

    //Se abre el modal de selección de número económico
    const modalRef = this.modalService.open(GenericSelectorComponent, { centered: true, backdrop: 'static', size: 'lg' });

    //Se establecen los valores de las propiedades del modal
    modalRef.componentInstance.rows = response.data.rows;
    modalRef.componentInstance.columns = this.activitiesColumns;
    modalRef.componentInstance.total = response.data.count;
    modalRef.componentInstance.page = 1;
    modalRef.componentInstance.selector = 'single';
    modalRef.componentInstance.title = 'Elija Actividad';
    modalRef.componentInstance.showSearchIcon = true;
    modalRef.componentInstance.btnRefresh = true;
    modalRef.componentInstance.initSearch = filter.searchValue;

    //Se establece el evento de filtrado de la tabla
    modalRef.componentInstance.filter.subscribe(async (filter: any) => {
      if (filter.page == 0) {
        filter.page = 1;
      }
      let response = await this.loadZonesDamages(filter);
      modalRef.componentInstance.rows = response.data.rows;
      modalRef.componentInstance.total = response.data.count;
    });

    //Se establece el evento de seleccion de un registro
    modalRef.componentInstance.selected.subscribe((selected: any) => {
      this.modalActivity = false;
      let item = selected[0];
      this.itemSelected = item;
      this.activities.at(this.index).patchValue({ activity: item.itemCode + '-' + item.itemDescription, activityAll: item });
    });
  }

  validateKeyPress(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
    const isNumber = /^[0-9]$/.test(event.key);

    if (!isNumber && !allowedKeys.includes(event.key)) {
      event.preventDefault(); // bloquea la tecla si no es número ni tecla permitida
    }
  }

  searchActivityCode(event, value: any, i) {

    if (!this.itemSelected) this.itemSelected = {};

    let val = value.activity;
    let item = this.itemSelected.itemCode + '-' + this.itemSelected.itemDescription;

    //Se valida que el valor no sea el mismo que el de la actividad
    if (item == val) {
      return;
    }

    if (this.modalActivity && event && event.type === 'blur') {
      return;
    }


    if (event && event.key === 'Enter' && val === '') {
      this.activities.at(i).patchValue({ activity: '', activityAll: '' });
      this.openActivitiesModalPage(i);
      return;
    }

    if (val === '') {
      this.activities.at(i).patchValue({ activity: '', activityAll: '' });
      this.itemSelected = {};
      return;
    }

    this.index = i;
    let filter = { searchValue: val || '' };
    this.loadZonesDamages(filter).then((response) => {
      if (response.data.count == 1) {
        let item = response.data.rows[0];
        this.itemSelected = item;
        this.activities.at(this.index).patchValue({ activity: item.itemCode + '-' + item.itemDescription, activityAll: item });
      } else {
        if (response.data.count == 0) {
          this.toastr.warning('No se encontró ninguna actividad con ese codigo', 'Advertencia');
        } else {
          this.toastr.warning('Se encontraron más de una actividad con ese código', 'Advertencia');
        }
        this.openActivitiesModalPage(i);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.modalActivity = true;
    }
  }

  //Localizar punteros en grid

  gridSize = 40; // Número de filas y columnas del grid

  getCellFromEvent(event: MouseEvent, adj = 0.06): any {
    const overlay = event.target as HTMLElement;
    const rect = overlay.getBoundingClientRect();

    const imgElement = document.querySelector('#img-container');
    if (!imgElement) {
      throw new Error('El contenedor de la imagen no se encontró.');
    }

    const imgRect = imgElement.getBoundingClientRect();

    // Verificar si el evento está fuera del contenedor
    if (event.clientX < imgRect.left || event.clientX > imgRect.right || event.clientY < imgRect.top || event.clientY > imgRect.bottom) {
      throw new Error('El evento ocurrió fuera del componente.');
    }

    const adjustment = rect.width * adj; // Ajuste basado en el 5% del ancho del elemento

    const offsetX = event.clientX - imgRect.left - adjustment;
    const offsetY = event.clientY - imgRect.top - adjustment;

    // Calcula las coordenadas relativas al contenedor del grid
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calcula el tamaño de cada celda
    const cellWidth = rect.width / this.gridSize;
    const cellHeight = rect.height / this.gridSize;

    // Determina la fila y columna en función de las coordenadas
    const column = Math.floor(x / cellWidth) + 1; // +1 para que empiece desde 1
    const row = Math.floor(y / cellHeight) + 1; // +1 para que empiece desde 1

    const result = { r: row, c: column, x: offsetX, y: offsetY, a: adjustment, w: rect.width, h: rect.height, e: imgElement };
    const pos = this.getPositionFromCell(row, column, adj);
    result.x = pos.x;
    result.y = pos.y;

    return result;
  }

  getPositionFromCell(r: number, c: number, adj = 0.06): { x: number, y: number } {
    const extra = { x: 4, y: 4 };

    const imgElement = document.querySelector('#img-container');
    if (!imgElement) {
      throw new Error('El contenedor de la imagen no se encontró.');
    }

    const rect = imgElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width > height) { extra.x = 8; }

    // Determinar orientación
    //const orientation = width > height ? 'horizontal' : width < height ? 'vertical' : 'cuadrada';
    //console.log(`La imagen es ${orientation} (ancho: ${width}, alto: ${height})`);

    const adjustment = width * adj;
    const cellWidth = width / this.gridSize;
    const cellHeight = height / this.gridSize;

    const x = ((c - 1) * cellWidth - adjustment) + extra.x;
    const y = ((r - 1) * cellHeight - adjustment) + extra.y;

    return { x, y };
  }

  getCoordinatesFromCell(r: number, c: number): { x: number; y: number } {
    const imgElement = document.querySelector('#img-container');
    const rect = imgElement.getBoundingClientRect();

    // Calcula el tamaño de cada celda
    const cellWidth = rect.width / this.gridSize;
    const cellHeight = rect.height / this.gridSize;

    // Calcula las coordenadas absolutas (x, y) basadas en la fila y columna
    const x = (c - 1) * cellWidth + rect.left; // -1 porque las columnas empiezan desde 1
    const y = (r - 1) * cellHeight + rect.top; // -1 porque las filas empiezan desde 1

    return { x, y };
  }

  getZoneFromPoint(x: number, y: number, width: number, height: number) {
    const horizontalThird = width / 3;
    const verticalThird = height / 3;
    const result = [];

    // Verificar si está en el centro exacto
    const centerXStart = horizontalThird;
    const centerXEnd = horizontalThird * 2;
    const centerYStart = verticalThird;
    const centerYEnd = verticalThird * 2;

    if (x >= centerXStart && x <= centerXEnd && y >= centerYStart && y <= centerYEnd) {
      result.push('CENTRO');
      return result; // Si está en el centro, no es necesario seguir evaluando
    }

    // Verificar si está en los tercios verticales
    if (y < verticalThird) {
      result.push('SUPERIOR');
    } else if (y < verticalThird * 2) {
      result.push('CENTRO');
    } else {
      result.push('INFERIOR');
    }

    // Verificar si está en los tercios horizontales
    if (x < horizontalThird) {
      result.push('IZQUIERDO');
    } else if (x < horizontalThird * 2) {
      result.push('CENTRO');
    } else {
      result.push('DERECHO');
    }

    return result;
  }

  getColor(x: number, y: number, width: number, height: number, rect: any) {
    //obtener el color de la coordenada en la imagen
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(rect, 0, 0, width, height);
    const imageData = ctx.getImageData(x, y, 1, 1);
    const pixel = imageData.data;
    const red = pixel[0] + 1000;
    const green = pixel[1];
    const blue = pixel[2];

    return `rgb(${red}, ${green}, ${blue})`;
  }

  validateActivityField(control: AbstractControl): { [key: string]: boolean } | null {
    const item = this.itemSelected.itemCode + '-' + this.itemSelected.itemDescription;
    if (control.value !== item) {
      return { activityAll: true };
    }
    return null;
  }

  validField(prop): any {
    return this.damageForm.value[prop];
  }

  getInitDanoI(): DanioI {
    let danioI = {} as DanioI;

    danioI.user = Session.getUser().userId;
    danioI.date = formatDateTime(new Date());

    return danioI;
  }

}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const datePart = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);

  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return `${datePart} ${hours}:${minutes}`;
}
