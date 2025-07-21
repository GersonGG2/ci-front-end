import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators, FormArray } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { WorkOrderService } from '../workOrderService.service';
import { GenericSelectorComponent } from 'src/app/features/component/generic-selector/genericselector.component';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { SysSelectLovI } from '../../ngx-wizard/workflow/workflow.model';
import { FileService } from 'src/app/shared/services/file.service';
import imageCompression from 'browser-image-compression';
import { ImgRetryComponent } from '../../img-retry.component';
import { Alert } from 'src/app/helpers/alerts';

@Component({
  selector: 'app-plan-line-add-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, GenericSelectorComponent, NgSelectComponent, NgOptionComponent, ImgRetryComponent],
  templateUrl: './plan-line-add-modal.component.html',
  styleUrl: './plan-line-add-modal.component.scss',
  providers: [WorkOrderService]
})
export class PlanLineAddModalComponent {
  @ViewChild('content', { static: true }) content: any;
  @ViewChild('fileChooser') fileChooser: any;
  modalRef: NgbModalRef;
  @Output() reloadEvent = new EventEmitter<any>();

  planLineForm = this.fb.group({
    id: [null],
    lineId: [null],
    headerId: [null],

    activity: ['', [Validators.required]],
    activityAll: [null],

    zoneType: [null, [Validators.required]],
    zoneName: [null],
    failure: [null, [Validators.required]],
    damageCondition: [null],
    quantity: [null, [Validators.required]],
    materialStatus: [false],
    comments: [null],

    photos: this.fb.array([]) as FormArray,
    files: this.fb.array([]) as FormArray
  });

  dialogTitle = '';
  headerData: any = {};
  inspectionType = '';
  allZoneTypes: any[] = [];
  zoneTypes: any[] = [];
  allZones: any[] = [];
  zones: any[] = [];
  failures: any[] = [];
  damageConditions: any[] = [];

  isHideButton = false;
  imagesDeleted = [];

  fileExtensionAllowed = '.jpg, .jpeg, .png';

  module = 'OT';

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private workOrderService: WorkOrderService,
    private toastr: ToastrService,
    private fileService: FileService
  ) {}

  async openPlanLineAddModal(data: any) {
    this.planLineForm.reset();

    (this.planLineForm.get('photos') as FormArray).clear();
    (this.planLineForm.get('files') as FormArray).clear();

    const response = await this.workOrderService.getPlanData(data.headerId, data.record);

    this.headerData = response?.data?.headerData;

    this.inspectionType = `${response?.data?.headerData?.odtType}`.toUpperCase() === 'MECANICA' ? 'HI' : 'HILL';

    this.planLineForm.patchValue({ lineId: data.record });

    const damageCondition = this.planLineForm.get('damageCondition');
    const zoneType = this.planLineForm.get('zoneType');
    if (this.inspectionType === 'HI') {
      damageCondition.clearValidators();
      damageCondition.updateValueAndValidity();
      zoneType.setValidators([Validators.required]);
      zoneType.updateValueAndValidity();
    } else {
      damageCondition.setValidators([Validators.required]);
      damageCondition.updateValueAndValidity();
      zoneType.clearValidators();
      zoneType.updateValueAndValidity();
    }
    // ---------------------

    let zoneTypes = [];
    if (this.inspectionType === 'HI') {
      zoneTypes = response.data.zoneTypes.filter((item) => item.zoneType !== 'ALL');
    } else {
      zoneTypes = response.data.zoneTypes.filter((item) => item.zoneType === 'ALL');
    }

    this.allZoneTypes = zoneTypes;
    this.zoneTypes = zoneTypes;
    this.allZones = response.data.allZones;
    this.failures = response.data.falla;
    this.damageConditions = response.data.danoConditions;

    if (data.action == 'add') {
      this.dialogTitle = 'Agregar detalles';
      this.isHideButton = true;
      this.planLineForm.enable();
    } else if (data.action == 'edit' || data.action == 'consult') {
      this.planLineForm.patchValue({
        lineId: data.record,
        zoneType: response?.data?.lineData?.zoneType,
        damageCondition: response?.data?.lineData?.danoCondition,
        failure: response?.data?.lineData.falla,
        quantity: response?.data?.lineData.quantity,
        comments: response?.data?.lineData.comments
      });

      const zoneType = this.planLineForm.value.zoneType;
      const itemCode = this.headerData.itemCode;
      if (itemCode !== 'TDA' && (zoneType === 'TRA' || zoneType === 'INT')) {
        let zoneSubtype = this.headerData.rearType ? `${this.headerData.rearType}`.substring(0, 1) : 'A';
        this.zones = this.allZones.filter((data) => data.itemCode === itemCode && data.zoneType === zoneType && data.zoneSubtype === zoneSubtype);
      } else {
        this.zones = this.allZones.filter((data) => data.itemCode === itemCode && data.zoneType === zoneType);
      }

      this.planLineForm.patchValue({ zoneName: response?.data?.lineData?.zoneId });

      let filter = { searchValue: response?.data?.lineData?.attribute1 };
      let activities = await this.loadZonesDamages(filter);

      this.planLineForm.patchValue({
        activity: activities.data.rows[0].itemCode + '-' + activities.data.rows[0].itemDescription,
        activityAll: activities.data.rows[0]
      });

      if (data.action == 'edit') {
        this.dialogTitle = 'Editar detalles';
        this.isHideButton = true;
        this.planLineForm.enable();
      } else {
        this.dialogTitle = 'Consultar detalles';
        this.isHideButton = false;
        this.planLineForm.disable();
      }

      const files = await this.fileService.getFiles(this.module, Number(this.planLineForm.value.lineId));

      let array = files.data.filter((data) => data.url.includes(`${this.module}_${this.headerData.headerId}_${this.planLineForm.value.lineId}`));
      const photos = this.planLineForm.get('photos') as FormArray;
      photos.clear();
      const files_ = this.planLineForm.get('files') as FormArray;
      files_.clear();
      array.forEach((element) => {
        photos.push(this.fb.control(element));
      });
    }

    this.modalRef = this.modalService.open(this.content, { ariaLabelledBy: 'modal-plan-line-add-title', size: 'xl' });
    // (this.planLineForm.get('photos') as FormArray).clear();
    // (this.planLineForm.get('files') as FormArray).clear()
  }

  doChangeZoneType() {
    this.planLineForm.patchValue({ zoneName: null });
    this.planLineForm.patchValue({ activity: '', activityAll: null });

    const zoneType = this.planLineForm.value.zoneType;
    const itemCode = this.headerData.itemCode;
    if (itemCode !== 'TDA' && (zoneType === 'TRA' || zoneType === 'INT')) {
      let zoneSubtype = this.headerData.rearType ? `${this.headerData.rearType}`.substring(0, 1) : 'A';
      this.zones = this.allZones.filter((data) => data.itemCode === itemCode && data.zoneType === zoneType && data.zoneSubtype === zoneSubtype);
    } else {
      this.zones = this.allZones.filter((data) => data.itemCode === itemCode && data.zoneType === zoneType);
    }
    this.planLineForm.patchValue({ zoneName: this.zones[0] });
  }

  doChangeZoneName() {
    this.planLineForm.patchValue({ activity: '', activityAll: null });
  }

  async addPhotos(event: Event): Promise<void> {
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

          const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type });

          // 4. Leer como DataURL (convertir a promesa para mejor manejo)
          const readerResult = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressedFile);
          });

          // Photos (previews como DataURL)
          const photos = this.planLineForm.get('photos') as FormArray;
          photos.push(this.fb.control(readerResult));

          // Files (archivos comprimidos)
          const files = this.planLineForm.get('files') as FormArray;
          files.push(this.fb.control(compressedFile));
        } catch (error) {
          console.error('Error procesando archivo:', file.name, error);
          // Podrías mostrar un mensaje al usuario aquí
        }
      }
    } catch (error) {
      console.error('Error general en addPhotos:', error);
    }
  }

  deleteAllFiles() {
    /*this.images.forEach((element) => {
      if (element.imagePath) {
        this.imagesDeleted.push(element);
      }
    });
    this.images = [];*/
  }

  async doDeleteImage(idx) {
    if (await Alert.question('Eliminar Foto', '<p>¿Desea eliminar la foto de manera <strong>"PERMANENTE"</strong>?</p>')) {
      const photos = this.planLineForm.get('photos') as FormArray;
      const files = this.planLineForm.get('files') as FormArray;

      const diff = photos.value.length - files.value.length;
      const fileIndex = diff - idx;

      if (!files.value[fileIndex]) {
        let deleteFile = {
          ids: [photos.value[idx].idFile]
        };

        await this.fileService.deleteFile(deleteFile);
      }
      photos.removeAt(idx);
      files.removeAt(fileIndex);
    }
  }

  async doSaveData() {
    if (this.planLineForm.invalid) {
      this.planLineForm.markAllAsTouched();
      this.toastr.error('Por favor complete todos los campos requeridos.', 'Error');
      return;
    }
    let payload = {
      lineId: this.planLineForm.value.lineId,
      headerId: this.headerData.headerId,
      materialId: this.planLineForm.value.activityAll.assemblyItemId,
      cant: Number(this.planLineForm.value.quantity),
      comments: this.planLineForm.value.comments ?? '',
      materialStatus: this.headerData.materialStatus,
      falla: this.planLineForm.value.failure,
      danoCondition: this.planLineForm.value.damageCondition ? this.planLineForm.value.damageCondition.toString() : '',
      zoneId: this.inspectionType === 'HI' ? this.planLineForm.value.zoneName : 0
    };

    const response = await this.workOrderService.postAddLine(payload);
    if (response.status == 200) {
      if (this.planLineForm.value.files.length > 0) {
        let lineId = response.data.lineId;
        let photosAlreadySaved = this.planLineForm.value.photos.filter((i) => !!i.url);
        let max = 0;
        if (photosAlreadySaved.length > 0) {
          max =
            Math.max(
              ...photosAlreadySaved.map((i) => {
                const split = i.fileName.split('.');
                let number = split[0].split('_').pop();
                return number;
              })
            ) + 1;
        }
        const renamedFiles = this.planLineForm.value.files.map((file, fileIndex) => {
          const extension = file.name.split('.').pop();
          let next = max + fileIndex;
          const newFileName = `${this.module}_${this.headerData.headerId}_${lineId}_${next}.${extension}`;
          return new File([file], newFileName, { type: file.type });
        });

        await this.fileService.uploadFiles(this.module, Number(lineId), `/data/attach/odt/plan/${this.headerData.headerId}/${lineId}/`, renamedFiles);
      }
      this.reloadEvent.emit();
      this.toastr.success('Guardado correcto de la información.', 'Éxito');
      this.modalRef.close();
    } else {
      this.toastr.error(response.error.message, 'Error');
    }
  }

  itemSelected: any = {};
  modalActivity = false;
  activitiesColumns = [
    { prop: 'itemCode', name: 'CÓDIGO', filter: false },
    { prop: 'itemDescription', name: 'DESCRIPCIÓN', filter: false },
    { prop: 'workforce', name: 'MO', filter: false }
  ];
  searchActivityCode(event) {
    /*if (!this.itemSelected) this.itemSelected = {};

    let val = value.activity;
    let item = this.itemSelected.itemCode + '-' + this.itemSelected.itemDescription;

    //Se valida que el valor no sea el mismo que el de la actividad
    if (item == val) {
      return;
    }

    if (this.modalActivity && event && event.type === 'blur') {
      return;
    } else if (this.modalActivity == false && event && event.type === 'blur') {
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
    });*/
  }

  async openActivitiesModalPage() {
    this.modalActivity = true;

    let searchCode = this.planLineForm.value.activity;

    if (!!this.planLineForm.value.activity) {
      let split = this.planLineForm.value.activity.split('-');

      if (!!split && split.length > 0) {
        searchCode = split[0];
      }
    }

    let filter = { searchValue: searchCode || '' };

    /*if (this.itemSelected.itemCode == searchCode) {
      filter.searchValue = '';
    }*/

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
      if (filter.page === 0) {
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
      this.planLineForm.patchValue({ activity: item.itemCode + '-' + item.itemDescription, activityAll: item });
    });
  }

  async loadZonesDamages(filter: any = {}) {
    let sysSelectLovI = {} as SysSelectLovI;
    sysSelectLovI.params = {} as any;
    sysSelectLovI.otherParams = {} as any;

    sysSelectLovI.module = 'lov_materials_zones';
    sysSelectLovI.params = filter;

    sysSelectLovI.otherParams.zoneType = this.planLineForm.value.zoneType;

    if (!!this.planLineForm.value.zoneName) {
      let element = this.zones.find((data) => data.zoneId === this.planLineForm.value.zoneName);

      sysSelectLovI.otherParams.zoneName = element.zoneName;
      sysSelectLovI.otherParams.itemCode = element.itemCode;
    }

    let response = await this.workOrderService.postZonesDamages(sysSelectLovI);

    return response;
  }
}
