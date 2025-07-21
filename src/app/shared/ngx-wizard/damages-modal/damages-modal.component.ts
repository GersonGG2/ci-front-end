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
import imgDetails from 'src/app/json/img_details.json';
import imageCompression from 'browser-image-compression';
import { Alert } from 'src/app/helpers/alerts';
import { Session } from 'src/app/helpers/session.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ImgRetryComponent } from '../../img-retry.component';
import { formatDateTime } from '../damages-tires-modal/damages-tires-modal.component';


@Component({
  selector: 'app-damages-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgbPaginationModule, GenericTableComponent, NgSelectComponent, ImgRetryComponent],
  templateUrl: './damages-modal.component.html',
  styleUrl: './damages-modal.component.scss'
})
export class DamagesModalComponent {
  @ViewChild('content', { static: true }) content: any;

  private matchedZone: any = null;

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
  zoneTypesListModal: any[] = [];

  index: number;

  zoneSubtype = '';

  module = '';

  information: any;

  @Output() damageEvent = new EventEmitter<number>();
  @Output() reloadEvent = new EventEmitter<any>();

  excludeItems = ['TDA'];

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private workflowService: WorkflowService,
    private toastr: ToastrService,
    private fileService: FileService
  ) { }

  loadDanioI: any = {};

  ngOnInit() {
    this.damageForm.valueChanges.subscribe((data) => {
    });
  }

  async openDamagesModal(id: string, danioI: DanioI, itemCode: string, rect: any = null, scale = 0.06) {
    this.id = id;
    this.loadDanioI = danioI;
    this.loadDanioI.itemCode = itemCode;

    // Asegurarnos de que el header_id esté presente
    if (!danioI.header_id) {
      danioI.header_id = id;
    }

    this.currentCircle = danioI;
    this.activities.clear();
    try {
      let response = await this.workflowService.getDetailDamagesByItemCode(danioI, itemCode);
      let inspectionResponse = await this.workflowService.getIncomingInspection(id);

      if (!!inspectionResponse.data && !!inspectionResponse.data.data && !!inspectionResponse.data.data.inspection) {
        this.information = inspectionResponse.data.data.inspection;
      }

      if (!!response.data) {
        this.module = response.data.data.currentData.movementType == 'E' ? 'input_inspections_detail' : 'output_inspections_detail';
        this.faultListModal = response.data.data.falla;
        let filter = response.data.data.allZones.filter((data) => data.zoneType === danioI.zone_type && data.itemCode === itemCode);

        if (['TRA', 'INT'].includes(danioI.zone_type)) {
          if (!this.excludeItems.includes(response.data.data.currentData.itemCode)) {
            const rearType = danioI.zone_type === 'TRA' ? response.data.data?.traZoneData?.traRearType : response.data.data?.currentData?.rearType;
            this.zoneSubtype = rearType === 'ABATIBLE' ? 'A' : 'C';
            this.zoneTypesListModal = filter.filter((data) => data.zoneSubtype === this.zoneSubtype);
          } else {
            this.zoneTypesListModal = filter;
          }
        } else {
          this.zoneTypesListModal = filter;
        }

        let data = imgDetails.GRID[itemCode];
        if (!data) data = imgDetails.GRID[danioI.zone_type];

        this.matchedZone = null;
        let zoneName = '';

        if (data) {
          Object.keys(data).forEach((key) => {
            if (!zoneName) {
              if (this.matchedZone == null && data[key].length == 0) {
                this.matchedZone = this.zoneTypesListModal.find((item) => item.zoneName === key);
                return;
              }

              const item = data[key].find((x: any) => x.r == danioI.r && x.c == danioI.c);
              if (item) {
                zoneName = key;
                this.matchedZone = this.zoneTypesListModal.find((item) => item.zoneName === zoneName);
                return;
              }
            }
          });
        } else {
          if (this.zoneTypesListModal.length > 0) {
            this.matchedZone = this.zoneTypesListModal[0];
          }
        }

        if (this.matchedZone) {
          this.loadDanioI.zoneName = this.matchedZone.zoneName;
        }

        const files = await this.fileService.getFiles(this.module, Number(this.id));
        if (!!response.data.data.entries && response.data.data.entries.length > 0) {
          response.data.data.entries.forEach((item: any, index: number) => {
            const activityForm = this.fb.group({
              detailId: [item.detailId],
              zone: [item.zoneId, Validators.required],
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
          this.addActivity(this.matchedZone);
        }
      } else {
        this.toastr.error(response.error.error.error, 'Error');
      }
    } catch (error) {
      this.toastr.error('Error al cargar los detalles del daño: ' + error.message, 'Error');
      return;
    }
    this.damagesModalRef = this.modalService.open(this.content, { size: 'lg' });
  }

  addActivity(zone?: any): void {
    const z = zone ?? this.matchedZone;
    const activityForm = this.fb.group({
      zone: [z?.zoneId, Validators.required],
      activity: ['', [Validators.required, this.validateActivityField.bind(this)]],
      activityAll: [''],
      fault: [null, Validators.required],
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
            file.name,
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


    if (Session.isViewInsp(this.id) || await Alert.question('Eliminar Foto', '<p>¿Desea eliminar la foto de manera <strong>"PERMANENTE"</strong>?</p>')) {
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

          if (!Session.isViewInsp(this.id)) await this.fileService.deleteFile(deleteFile);

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

      // Obtener la falla seleccionada del faultListModal
      const selectedFault = this.faultListModal.find(fault => fault.listValueId === element.fault);
      if (selectedFault) {
        entryI.failure.id = selectedFault.listValueId;
        entryI.failure.value = selectedFault.meaning;
        entryI.failure.list_code = selectedFault.listCode;
      }

      entryI.serial.code = element.activityAll.itemCode;
      entryI.serial.description = element.activityAll.itemDescription;
      entryI.serial.assemblyItemId = element.activityAll.assemblyItemId;
      entryI.serial.workforce = element.activityAll.workforce;

      entryI.zone.zoneId = element.zone;

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
      this.reloadEvent.emit({
        id: this.id,
        danoOrder: this.currentCircle.dano_order,
        danoType: this.currentCircle.dano_type,
        zoneType: this.currentCircle.zone_type,
        c: this.currentCircle.c,
        r: this.currentCircle.r,
      });
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

    const zonaId = this.activities.at(this.index).get('zone')?.value;
    const zona = this.zoneTypesListModal.find((item) => item.zoneId === Number(zonaId));

    sysSelectLovI.otherParams.zoneType = this.currentCircle.zone_type;
    sysSelectLovI.otherParams.zoneName = zona.zoneName;
    sysSelectLovI.otherParams.itemCode = this.loadDanioI.itemCode;

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

  /**
   *
    //obtener el src de la imagen
    const imgSrc = imgElement.getAttribute('src').replace('.png', '').split('/');
    const type = imgSrc[imgSrc.length - 1];
    const item = imgSrc[imgSrc.length - 2];


    if (item.toUpperCase() == 'TDA') {
      extra.x = 8;
    }


   */

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
    } else if (this.modalActivity == false && (event && event.type === 'blur')) {
      this.modalActivity = true;
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

  count_activities(): number {
    return (this.damageForm.get('activities') as FormArray).length; // Asegúrate de que sea un FormArray
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

  getCellFromXY(x: number, y: number, adj = 0.06): { r: number, c: number } {
    const imgElement = document.querySelector('#img-container');
    if (!imgElement) {
      throw new Error('El contenedor de la imagen no se encontró.');
    }

    const rect = imgElement.getBoundingClientRect();
    const adjustment = rect.width * adj;

    const cellWidth = rect.width / this.gridSize;
    const cellHeight = rect.height / this.gridSize;

    // Revertimos el offset aplicado anteriormente
    const offsetX = x + adjustment - 4; // 4 fue el `extra.x`
    const offsetY = y + adjustment - 4; // 4 fue el `extra.y`

    const c = Math.floor(offsetX / cellWidth) + 1;
    const r = Math.floor(offsetY / cellHeight) + 1;

    return { r, c };
  }

  getInitDanoI(): DanioI {
    let danioI = {} as DanioI;

    danioI.user = Session.getUser().userId;
    danioI.date = formatDateTime(new Date());

    return danioI;
  }

}
