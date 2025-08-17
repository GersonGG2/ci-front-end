import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PeriodosService } from '../periodo.service';
import { GenericTableComponent } from "../../component/generic-table/generictable.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GenericSelectorComponent } from '../../component/generic-selector/genericselector.component';

@Component({
  selector: 'app-ver-curso',
  templateUrl: './ver-curso.component.html',
  styleUrl: './ver-curso.component.scss',
  imports: [GenericTableComponent, CommonModule, ReactiveFormsModule],
  providers: [PeriodosService],
})
export class VerCursoComponent implements OnInit {
  @ViewChild('inscripcionModal') inscripcionModal: any;
  @ViewChild('changeStatusModal') changeStatusModal: any;
  statusForm: FormGroup;

  curso: any = null;
  inscripciones: any[] = [];
  inscripcionForm: FormGroup;

  totalItems = 0;
  page = 1;
  limit = 10;
  columns = [
    { name: 'Docente', prop: 'docenteNombre', filter: true },
    { name: 'Email', prop: 'docenteEmail', filter: true },
    // { name: 'Estado docente', prop: 'docenteEstadoHtml', customView: 'docenteEstadoHtml', filter: false },
    { name: 'Estado inscripción', prop: 'estadoHtml', customView: 'estadoHtml', filter: true },
    { name: 'Fecha inscripción', prop: 'fechaInscripcion', filter: false },
    {
      name: 'ACCIÓN',
      prop: 'action',
      frozenRight: true,
      validate: (value, row) => this.filterOptions(value, row),
      actions: [
        { name: 'Cambiar estado', icon: 'edit', action: (value, row) => this.changeStatus(row) },
        { name: 'Descargar constancia', icon: 'file', action: (value, row) => '' }
      ]
    }
  ];

  filterOptions(option, row) {
    // Siempre mostrar opción de cambiar estado
    if (option.name === 'Cambiar estado') {
      return true;
    }

    // Solo mostrar opción de descargar constancia si el estado es "aprobado"
    if (option.name === 'Descargar constancia') {
      return row.estado === 'aprobado';
    }

    return false;
  }
  estados = [
    { value: 'inscrito', text: 'Inscrito' },
    { value: 'aprobado', text: 'Aprobado' },
    { value: 'reprobado', text: 'Reprobado' },
    { value: 'cancelado', text: 'Cancelado' }
  ];

  docentes: any[] = [];

  selectedDocenteData: any = null;
  docenteList: any[] = [];
  totalItemsDocente = 0;
  pageDocente = 1;
  columns_docente = [
    { name: 'Nombre', prop: 'nombre' },
    { name: 'Apellidos', prop: 'apellidos' },
    { name: 'Email', prop: 'email' }
  ];

  constructor(
    private route: ActivatedRoute,
    private periodosService: PeriodosService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.inscripcionForm = this.fb.group({
      cursoId: [{ value: '', disabled: true }, Validators.required],
      docenteId: ['', Validators.required],
      docenteNombre: [{ value: '' }], // Añade este campo
      estado: ['inscrito', Validators.required]
    });
  }


  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.curso = await this.periodosService.getCursoById(id);
    this.inscripcionForm.patchValue({ cursoId: this.curso.id });

    await this.loadInscripciones(id);
  }
  async loadInscripciones(cursoId: string) {
    try {
      const res = await this.periodosService.getAllInscripciones({ cursoId });
      // Aquí la API devuelve directamente {count, rows} y no {data: {count, rows}}
      this.inscripciones = this.handleInscripcionesResponse(res.rows || []);
      this.totalItems = res.count || 0;
    } catch (error) {
      console.error('Error al cargar inscripciones:', error);
      this.inscripciones = [];
      this.totalItems = 0;
      this.toastr.error('Error al cargar las inscripciones');
    }
  }

  handleInscripcionesResponse(response: any[]): any[] {
    return response.map(item => {
      let estadoHtml = '';
      switch (item.estado) {
        case 'inscrito':
          estadoHtml = `<span class="badge bg-info text-white">Inscrito</span>`;
          break;
        case 'aprobado':
          estadoHtml = `<span class="badge bg-success text-white">Aprobado</span>`;
          break;
        case 'reprobado':
          estadoHtml = `<span class="badge bg-danger text-white">Reprobado</span>`;
          break;
        case 'cancelado':
          estadoHtml = `<span class="badge bg-secondary text-white">Cancelado</span>`;
          break;
        default:
          estadoHtml = `<span class="badge bg-secondary text-white">${item.estado}</span>`;
      }

      let docenteEstadoHtml = item.docente?.estado
        ? `<span class="badge bg-success text-white">Activo</span>`
        : `<span class="badge bg-danger text-white">Inactivo</span>`;

      return {
        id: item.id,
        docenteNombre: item.docente ? `${item.docente.nombre} ${item.docente.apellidos}` : '',
        docenteEmail: item.docente?.email || '',
        docenteEstadoHtml,
        estado: item.estado,
        estadoHtml,
        fechaInscripcion: item.fechaInscripcion
          ? new Date(item.fechaInscripcion).toLocaleDateString()
          : ''
      };
    });
  }

  openInscripcionModal() {
    this.inscripcionForm.reset({
      cursoId: this.curso.id,
      docenteId: '',
      docenteNombre: '',
      estado: 'inscrito'
    });
    this.modalService.open(this.inscripcionModal, { centered: true, backdrop: 'static' });
  }

  async saveInscripcion(modal: any) {
    if (this.inscripcionForm.invalid) {
      this.toastr.error('Completa todos los campos');
      return;
    }
    const data = {
      cursoId: this.curso.id,
      docenteId: this.inscripcionForm.get('docenteId')?.value,
      estado: this.inscripcionForm.get('estado')?.value
    };
    try {
      await this.periodosService.createInscripcion(data);
      this.toastr.success('Inscripción agregada');
      modal.dismiss();
      // Recargar inscripciones
      await this.loadInscripciones(this.curso.id);
    } catch (err) {
      this.toastr.error('Error al agregar inscripción');
    }
  }
  clearField(fieldProp: string): void {
    this.inscripcionForm.patchValue({ [fieldProp]: null });

    // Si se limpia el nombre del docente, también limpiamos su ID
    if (fieldProp === 'docenteNombre') {
      this.inscripcionForm.patchValue({ docenteId: null });
      this.selectedDocenteData = null;
    }
  }
  // ==================================================
  // SELECTOR DE DOCENTES
  // ==================================================
  async loadDocentes(filter: any = {}) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const searchValue = filter.searchValue || '';
    const res = await this.periodosService.getDocentes(page, limit, searchValue);
    this.docenteList = res.data.rows.map((d: any) => ({
      id: d.id,
      nombre: d.nombre,
      apellidos: d.apellidos,
      email: d.email,
      estado: d.estado
    }));
    this.totalItemsDocente = res.data.count;
  }

  async openSelectDocenteModal(): Promise<void> {
    await this.loadDocentes();
    // Si solo hay una coincidencia, seleccionarla automáticamente
    if (this.docenteList.length === 1) {
      this.onDocenteSelected([this.docenteList[0]]);
      return;
    }
    const modalRef = this.modalService.open(GenericSelectorComponent, { centered: true, backdrop: 'static', size: 'xl' });
    modalRef.componentInstance.rows = this.docenteList;
    modalRef.componentInstance.columns = this.columns_docente;
    modalRef.componentInstance.total = this.totalItemsDocente;
    modalRef.componentInstance.page = this.pageDocente;
    modalRef.componentInstance.selector = 'single';
    modalRef.componentInstance.title = 'Elija Docente';
    modalRef.componentInstance.showSearchIcon = true;
    modalRef.componentInstance.btnRefresh = true;

    modalRef.componentInstance.selected.subscribe((selected: any) => {
      this.onDocenteSelected(selected);
    });
  }

  onDocenteSelected(docente: any): void {
    if (docente && docente.length > 0) {
      this.selectedDocenteData = docente[0];
      this.inscripcionForm.patchValue({
        docenteNombre: `${this.selectedDocenteData.nombre} ${this.selectedDocenteData.apellidos}`,
        docenteId: this.selectedDocenteData.id
      });
    } else {
      this.selectedDocenteData = null;
      this.inscripcionForm.patchValue({
        docenteNombre: '',
        docenteId: ''
      });
    }
  }

  async changeStatus(row: any) {
    // Crear formulario para cambiar estado
    this.statusForm = this.fb.group({
      estado: [row.estado, Validators.required]
    });

    // Abrir modal usando la referencia al template
    const modalRef = this.modalService.open(this.changeStatusModal, {
      centered: true,
      backdrop: 'static'
    });

    try {
      const result = await modalRef.result;
      if (result) {
        await this.periodosService.updateInscripcion({
          id: row.id,
          estado: result.estado
        });

        this.toastr.success('Estado de inscripción actualizado');
        // Recargar inscripciones
        await this.loadInscripciones(this.curso.id);
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      // No mostrar error si el usuario simplemente cerró el modal
      if (error !== 'dismissed') {
        this.toastr.error('Error al cambiar el estado');
      }
    }
  }

}
