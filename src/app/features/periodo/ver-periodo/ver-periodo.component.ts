import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeriodosService } from '../periodo.service';
import { CursosService } from '../../cursos/cursos.service';
import { GenericTableComponent } from "../../component/generic-table/generictable.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Alert } from 'src/app/helpers/alerts';
import { GenericSelectorComponent } from '../../component/generic-selector/genericselector.component';

@Component({
  selector: 'app-ver-periodo',
  templateUrl: './ver-periodo.component.html',
  styleUrls: ['./ver-periodo.component.scss'],
  imports: [GenericTableComponent, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [PeriodosService],
})
export class VerPeriodoComponent implements OnInit {
  @ViewChild('cursoModal') cursoModal: any;
  @ViewChild('changeStatusModal') changeStatusModal: any;
  @ViewChild('deleteCursoModal') deleteCursoModal: any;
  @ViewChild(GenericTableComponent) genericTable: GenericTableComponent;

  periodo: any = null;
  cursos: any[] = [];
  totalItems = 0;
  page = 1;
  limit = 10;
  columns: any[] = [];
  // Listas para los selectores
  academias: any[] = [];
  instructores: any[] = [];

  // Formulario para el nuevo curso
  cursoForm: FormGroup;

  isAdmin: boolean = false;
  isJefe: boolean = false;
  isDocente: boolean = false;
  isInstructor: boolean = false;

  updateColumns() {
    let defaultEstado = '';
    if (this.isAdmin || this.isJefe) {
      defaultEstado = 'propuesto';
    } else if (this.isJefe) {
      defaultEstado = 'nuevo';
    } else if (this.isInstructor) {
      defaultEstado = 'aprobado';
    } else if (this.isDocente) {
      defaultEstado = 'aprobado';
    }

    this.columns = [
      ...(this.isAdmin || this.isJefe ? [{
        prop: 'id', name: '#', filter: false, checkbox: true, width: 5, sortable: false,
      }] : []),
      {
        name: 'Nombre',
        prop: 'nombre',
        customView: 'nombreHtml',
        filter: true
      },
      { name: 'Objetivo', prop: 'objetivo', filter: true },
      {
        name: 'Academia',
        prop: 'academiaId',
        customView: 'academiaHtml',
        filter: true,
        type: 'select',
        options: [
          { value: 1, text: 'Ingeniería en Sistemas Computacionales' },
          { value: 2, text: 'Ingeniería Civil' },
          { value: 3, text: 'Ingeniería Industrial' },
          { value: 4, text: 'Ingeniería Electromecánica' },
          { value: 5, text: 'Ingeniería Química' },
          { value: 6, text: 'Ingeniería Bioquímica' },
          { value: 7, text: 'Ingeniería en Gestión Empresarial' },
          { value: 8, text: 'Licenciatura en Administración' },
          { value: 9, text: 'Licenciatura en Turismo' },
          { value: 10, text: 'Ingeniería en Ciencia de Datos' }
        ]
      },
      { name: 'Instructor', prop: 'instructorNombre', customView: 'instructorHtml', filter: false },
      {
        name: 'Tipo FD/AP',
        prop: 'tipo',
        filter: true,
        type: 'select',
        options: [
          { value: 'FD', text: 'Tipo FD' },
          { value: 'AP', text: 'Tipo AP' }
        ]
      },
      {
        name: 'Estado',
        prop: 'estado',
        customView: 'estadoHtml',
        filter: true,
        sortable: false,
        type: 'select',
        options: [
          { value: 'nuevo', text: 'Nuevo' },
          { value: 'propuesto', text: 'Propuesto' },
          { value: 'aprobado', text: 'Aprobado' },
          { value: 'finalizado', text: 'Finalizado' },
          { value: 'rechazado', text: 'Rechazado' }
        ],
        default: defaultEstado // <--- Aquí va el default dinámico
      },
      ...(this.isAdmin || this.isJefe ? [{
        prop: 'action', name: 'Acción', width: 40, actions: [
          { name: 'Ver Curso', icon: 'eye', action: (value, row) => this.verDetalleCurso(row) },
          { name: 'Editar', icon: 'edit', action: (value, row) => this.openCursoModal(row, 'edit') },
          { name: 'Copiar', icon: 'copy', action: (value, row) => this.openCursoModal(row, 'copy') },
          { name: 'Eliminar', icon: 'trash', action: (value, row) => this.doDeleteCurso(row) }
        ]
      }] : [{
        prop: 'action', name: 'Acción', width: 40, actions: [
          { name: 'Ver Curso', icon: 'eye', action: (value, row) => this.verDetalleCurso(row) }
        ]
      }])
    ];
  }

  props = [
    { prop: 'Cambiar estatus', name: 'Cambiar estatus', icon: 'sync', action: () => this.openChangeStatusModal() },
    { prop: 'Eliminar', name: 'Eliminar', icon: 'trash', action: () => this.openDeleteCursoModal() },
    { prop: 'Descargar PDF', name: 'Descargar PDF', icon: 'file-pdf', action: () => this.exportarCursosPdf() },
    { prop: 'Exportar Excel', name: 'Exportar Excel', icon: 'file-excel', action: () => this.exportarCursosExcel() },
    { prop: 'Importar Excel', name: 'Importar Excel', icon: 'file-excel', action: () => this.openImportExcelModal() }
  ]


  constructor(
    private route: ActivatedRoute,
    private periodosService: PeriodosService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private router: Router
  ) {
    // Inicializar formulario
    this.cursoForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      objetivo: ['', Validators.required],
      periodoId: [{ value: '', disabled: true }, Validators.required],
      academiaId: ['', Validators.required],
      instructorName: ['', Validators.required],
      instructorId: ['', Validators.required],
      instructorDosName: [''],
      instructorDosId: [null],
      lugar: ['', Validators.required],
      aula: ['', Validators.required],
      horas: [30, [Validators.required, Validators.min(1)]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      hora_inicio: ['08:00', Validators.required],
      hora_fin: ['14:00', Validators.required],
      dirigido_a: ['', Validators.required],
      prerequisitos: [''],
      estado: ['nuevo'],
      tipo: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      const id = params['id'];
      await this.loadPeriodo(id);
      await this.loadCursos(id); // Los roles se actualizan aquí
      // updateColumns ya se llama dentro de loadCursos
      this.loadFormData();
    });
  }

  verCurso(row: any) {
    this.router.navigate(['/periodo/cursos', this.periodo.id, 'docentes', row.id]);
  }


  async doDeleteCurso(row: any): Promise<void> {
    if (await Alert.question('Confirmación', '¿Estás seguro de que desea eliminar este curso?')) {
      this.periodosService
        .deleteCurso(row.id)
        .then(() => {
          this.toastr.success('Curso eliminado correctamente.', 'Éxito');
          this.loadCursos(this.periodo.id);
        })
        .catch((error) => {
          console.error('Error al eliminar el curso:', error);
          this.toastr.error('Error al eliminar el curso, intente nuevamente.', 'Error');
        });
    }
  }

  async loadPeriodo(id: string) {
    try {
      const res = await this.periodosService.getPeriodoById(id);
      if (!res || !res.id) {
        this.periodo = null;
        this.toastr.error('No se encontró información del periodo');
        return;
      }
      this.periodo = res;
      this.isAdmin = res.isAdmin;
      this.isJefe = !!res.isJefe;
      this.isDocente = !!res.isDocente;
      this.isInstructor = !!res.isInstructor;
      //  Agrega este console.log para debug
      console.log('Roles cargados:', {
        isAdmin: this.isAdmin,
        isJefe: this.isJefe,
        isDocente: this.isDocente,
        isInstructor: this.isInstructor
      });
      this.updateColumns();
      this.cursoForm.patchValue({
        periodoId: this.periodo.id
      });
    } catch (error) {
      console.error('Error al cargar periodo:', error);
      this.periodo = null;
      this.toastr.error('Error al cargar datos del periodo');
    }
  }
  // Agrega esta función en tu componente
  private mapTableFiltersToApi(filters: any): any {
    const apiFilters: any = {};

    if (filters.searchValue) {
      apiFilters.searchValue = filters.searchValue;
    } else if (filters.search) {
      apiFilters.searchValue = filters.search;
    } else if (filters.nombre || filters.objetivo) {
      apiFilters.searchValue = [filters.nombre, filters.objetivo].filter(Boolean).join(' ');
    }

    // Combina nombre y objetivo en searchValue
    if (filters.nombre || filters.objetivo) {
      apiFilters.searchValue = [filters.nombre, filters.objetivo].filter(Boolean).join(' ');
    }
    // Si tienes select de academia, mapea el id
    if (filters.academiaId) {
      apiFilters.academiaId = filters.academiaId; // O ajusta si tienes el id real
    }
    if (filters.estado) {
      apiFilters.estado = filters.estado;
    }
    if (filters.tipo) {
      apiFilters.tipo = filters.tipo; // <-- mapea el filtro de tipo
    }
    // Agrega otros filtros si los tienes
    return apiFilters;
  }


  async loadCursos(periodoId: string) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      let filters: any = { periodoId };

      if (this.isAdmin) {
        filters.estado = 'propuesto';
      } else if (this.isJefe) {
        filters.userId = userId;
        filters.estado = 'nuevo';
      } else if (this.isInstructor) {
        filters.estado = 'aprobado';
      } else if (this.isDocente) {
        filters.estado = 'aprobado';
      }

      console.log('Filtros enviados a getAllCursos:', filters);

      const res = await this.periodosService.getAllCursos(this.page, this.limit, filters);

      if (res) {
        this.isAdmin = res.isAdmin ?? false;
        this.isJefe = res.isJefe ?? false;
        this.isDocente = res.isDocente ?? false;
        this.isInstructor = res.isInstructor ?? false;

        console.log('Roles actualizados desde getAllCursos:', {
          isAdmin: this.isAdmin,
          isJefe: this.isJefe,
          isDocente: this.isDocente,
          isInstructor: this.isInstructor
        });

        // Actualiza las columnas después de obtener los roles
        this.updateColumns();
      }

      // Procesa la respuesta y asigna datos a la tabla
      if (res && res.rows) {
        this.cursos = this.handleCursosResponse(res.rows);
        this.totalItems = res.count;
      } else if (res && res.data && res.data.rows) {
        this.cursos = this.handleCursosResponse(res.data.rows);
        this.totalItems = res.data.count;
      } else {
        console.error('Formato de respuesta inesperado:', res);
        this.cursos = [];
        this.totalItems = 0;
      }
    } catch (error) {
      console.error('Error en loadCursos:', error);
      this.cursos = [];
      this.totalItems = 0;
    }
  }

  async applyFilter(filter: any = {}): Promise<void> {
    // Mapea los filtros de la tabla a los nombres que espera el backend
    const apiFilters = this.mapTableFiltersToApi(filter);
    // Siempre agrega el periodoId
    apiFilters.periodoId = this.periodo?.id;
    // Si tu lógica de roles aplica, puedes agregar aquí userId o estado por defecto
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    if (this.isJefe) {
      apiFilters.userId = userId;
      if (!apiFilters.estado) apiFilters.estado = 'nuevo';
    }
    // if (this.isAdmin && !apiFilters.estado) {
    //   apiFilters.estado = 'propuesto';
    // }
    if ((this.isInstructor || this.isDocente) && !apiFilters.estado) {
      apiFilters.estado = 'aprobado';
    }

    this.page = 1;
    try {
      const res = await this.periodosService.getAllCursos(this.page, this.limit, apiFilters);
      if (res && res.rows) {
        this.cursos = this.handleCursosResponse(res.rows);
        this.totalItems = res.count;
      } else if (res && res.data && res.data.rows) {
        this.cursos = this.handleCursosResponse(res.data.rows);
        this.totalItems = res.data.count;
      } else {
        this.cursos = [];
        this.totalItems = 0;
      }
    } catch (error) {
      this.cursos = [];
      this.totalItems = 0;
    }
  }
  // Cargar datos necesarios para el formulario
  async loadFormData() {
    try {
      // Cargar academias desde el backend
      const res = await this.periodosService.getAllAcademias(1, 50).toPromise();
      this.academias = res.data?.rows || [];
      // Aquí puedes cargar las academias e instructores de tus servicios

      // Cargar instructores desde el API de usuarios con filtro de rol
      const resInstructores = await this.periodosService.getAllInstructores();
      // La estructura de respuesta incluye data.rows según la documentación
      this.instructores = resInstructores.data?.rows || [];

    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
    }
  }

  handleCursosResponse(response: any[]): any[] {
    return response.map(item => {
      const estadoHtml =
        item.estado === 'nuevo'
          ? `<span class="badge bg-secondary text-white">Nuevo</span>`
          : item.estado === 'propuesto'
            ? `<span class="badge bg-warning text-dark">Propuesto</span>`
            : item.estado === 'aprobado'
              ? `<span class="badge bg-success text-white">Aprobado</span>`
              : item.estado === 'finalizado'
                ? `<span class="badge bg-primary text-white">Finalizado</span>`
                : item.estado === 'rechazado'
                  ? `<span class="badge bg-danger text-white">Rechazado</span>`
                  : `<span class="badge bg-secondary text-white">${item.estado}</span>`;

      // const nombreHtml = `<span>${item.nombre}</span>`;
      // const nombreHtml = `<a class="link-action text-primary" href="/periodo/detail/curso/${item.id}">${item.nombre}</a>`;
      const nombreHtml = `<a class="link-action text-primary href-/periodo/cursos/${this.periodo.id}/docentes/${item.id}">${item.nombre}</a>`;

      const academiaHtml = item.academia
        ? `<span>${item.academia.nombre}</span>`
        : `<span class="text-muted">Sin academia</span>`;
      const instructorHtml = item.instructor
        ? `<span>${item.instructor.nombre} ${item.instructor.apellidos}</span><br/><span>${item.instructorDos ? (item.instructorDos.nombre + ' ' + item.instructorDos.apellidos) : ''}</span>`
        : `<span class="text-muted">Sin instructor</span>`;

      return {
        ...item,
        estadoHtml,
        nombreHtml,
        academiaHtml,
        instructorHtml,
        academiaNombre: item.academia ? item.academia.nombre : '',
        instructorNombre: item.instructor ? `${item.instructor.nombre} ${item.instructor.apellidos}` : ''
      };
    });
  }

  formMode: 'add' | 'edit' | 'copy' = 'add';
  private initialFormValue: any;
  // Método para abrir el modal
  openCursoModal(curso?: any, mode: 'add' | 'edit' | 'copy' = 'add') {
    this.formMode = mode;
    if (!this.periodo || !this.periodo.id) {
      this.toastr.error('No se ha cargado el periodo. Intenta de nuevo en unos segundos.');
      return;
    }
    if (curso && mode === 'edit') {
      this.cursoForm.reset({
        id: curso.id,
        ...curso,
        periodoId: this.periodo.id,
        fecha_inicio: curso.fecha_inicio || this.periodo.fecha_inicio,
        fecha_fin: curso.fecha_fin || this.periodo.fecha_fin,
        estado: this.isJefe ? 'nuevo' : curso.estado, // <--- fuerza propuesto si es jefe
        instructorName: `${curso.instructor?.nombre || ''} ${curso.instructor?.apellidos || ''}`,
        instructorId: curso.instructorId || ''
      });
    } else if (curso && mode === 'copy') {
      const { id, ...rest } = curso;
      this.cursoForm.reset({
        ...rest,
        periodoId: this.periodo.id,
        fecha_inicio: curso.fecha_inicio || this.periodo.fecha_inicio,
        fecha_fin: curso.fecha_fin || this.periodo.fecha_fin,
        estado: this.isJefe ? 'nuevo' : rest.estado, // <--- fuerza propuesto si es jefe
        instructorName: `${curso.instructor?.nombre || ''} ${curso.instructor?.apellidos || ''}`,
        instructorId: curso.instructorId || ''

      });
    } else {
      this.cursoForm.reset({
        periodoId: this.periodo.id,
        estado: 'nuevo',
        horas: '',
        hora_inicio: '',
        hora_fin: '',
        fecha_inicio: this.periodo.fecha_inicio,
        fecha_fin: this.periodo.fecha_fin,
        tipo: '',
        instructorName: '',
        instructorId: '',
        academiaId: '',
      });
    }

    // Si es jefe, fuerza el valor y deshabilita el control
    if (this.isJefe) {
      this.cursoForm.get('estado')?.setValue('nuevo');
      this.cursoForm.get('estado')?.disable();
    } else {
      this.cursoForm.get('estado')?.enable();
    }

    this.modalService.open(this.cursoModal, {
      centered: true,
      size: 'lg',
      backdrop: 'static'
    });
    this.initialFormValue = this.cursoForm.getRawValue();
  }

  hasFormChanges(): boolean {
    return JSON.stringify(this.cursoForm.getRawValue()) !== JSON.stringify(this.initialFormValue);
  }
  async onCloseCursoModal(modal: any) {
    if (this.hasFormChanges()) {
      const confirmado = await Alert.question(
        'Confirmación',
        'Tienes cambios sin guardar. ¿Seguro que quieres salir? Los datos se perderán.'
      );
      if (!confirmado) return;
    }
    modal.dismiss();
  }
  // Método para guardar el curso
  async saveCurso() {
    if (this.cursoForm.invalid) {
      this.toastr.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const raw = this.cursoForm.getRawValue();
      // Obtén el usuario logueado del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;

      const cursoData = {
        ...raw,
        academiaId: Number(raw.academiaId),
        instructorId: Number(raw.instructorId),
        instructorDosId: raw.instructorDosId ? Number(raw.instructorDosId) : null,
        createdBy: userId // <-- Ahora se envía el ID real
      };
      if (cursoData.estado === 'rechazado') {
        cursoData.comentario_rechazo = raw.comentario_rechazo;
      }

      if (this.formMode === 'edit' && raw.id) {
        await this.periodosService.updateCurso(raw.id, cursoData);
        this.toastr.success('Curso actualizado correctamente');
      } else {
        await this.periodosService.createCurso(cursoData);
        this.toastr.success('Curso creado correctamente');
      }
      this.modalService.dismissAll();
      this.loadCursos(this.periodo.id);
    } catch (error) {
      console.error('Error al guardar curso:', error);
      this.toastr.error('Error al guardar el curso');
    }
  }

  verDetalleCurso(curso: any) {
    this.router.navigate(['/periodo/cursos', this.periodo.id, 'docentes', curso.id]);
  }

  openChangeStatusModal(row?: any) {
    // Si no hay cursos seleccionados, muestra el toast y no abre el modal
    if (!this.selectedIds || this.selectedIds.length === 0) {
      this.toastr.error('Debes seleccionar al menos un curso para cambiar el estatus.');
      return;
    }
    this.selectedCurso = row;
    this.modalService.open(this.changeStatusModal, {
      centered: true,
      size: 'md',
      backdrop: 'static'
    });
  }

  async openDeleteCursoModal() {
    if (!this.selectedIds || this.selectedIds.length === 0) {
      this.toastr.error('Selecciona al menos un curso para eliminar');
      return;
    }
    const confirmado = await Alert.question(
      'Confirmación',
      '¿Estás seguro de que desea eliminar los cursos seleccionados?'
    );
    if (confirmado) {
      await this.eliminarSeleccionados();
    }
  }

  async eliminarSeleccionados() {
    if (!this.selectedIds || this.selectedIds.length === 0) {
      this.toastr.error('Selecciona al menos un curso para eliminar');
      return;
    }
    try {
      await this.periodosService.eliminarMultiplesCursos(this.selectedIds);
      this.toastr.success('Cursos eliminados correctamente');
      await this.loadCursos(this.periodo.id);
      if (this.genericTable) this.genericTable.clearSelection();
    } catch (error) {
      this.toastr.error('Error al eliminar cursos');
    }
  }

  nuevoEstado: string = 'propuesto';
  selectedCurso: any = null;

  async cambiarEstadoCurso(modal: any) {
    if (!this.selectedCurso) return;
    try {
      await this.periodosService.updateCurso(this.selectedCurso.id, { estado: this.nuevoEstado });
      this.toastr.success('Estatus actualizado correctamente');
      modal.dismiss();
      this.loadCursos(this.periodo.id);
    } catch (error) {
      this.toastr.error('Error al actualizar el estatus');
    }
  }

  async confirmDeleteCurso(modal: any) {
    if (!this.selectedCurso) return;
    try {
      await this.periodosService.deleteCurso(this.selectedCurso.id);
      this.toastr.success('Curso eliminado exitosamente');
      modal.dismiss();
      this.loadCursos(this.periodo.id);
    } catch (error) {
      this.toastr.error('Error al eliminar el curso');
    }
  }

  selectedIds: number[] = [];

  onSelectionChange(selectedRows: any[]) {
    this.selectedIds = selectedRows.map(row => row.id);
  }

  async aprobarSeleccionados(modal?: any) {
    if (!this.selectedIds || this.selectedIds.length === 0) {
      this.toastr.error('Selecciona al menos un curso');
      return;
    }
    try {
      await this.periodosService.aprobarMultiplesCursos(this.selectedIds, this.nuevoEstado);
      this.toastr.success('Cursos actualizados correctamente');
      if (modal) modal.dismiss();
      await this.loadCursos(this.periodo.id);
      if (this.genericTable) this.genericTable.clearSelection();
    } catch (error) {
      this.toastr.error('Error al actualizar cursos');
    }
  }

  async enviarCursosNuevos() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    const periodoId = this.periodo?.id;

    if (!userId || !periodoId) {
      this.toastr.error('No se pudo obtener el usuario o periodo.');
      return;
    }

    const confirmado = await Alert.question(
      'Confirmación',
      '¿Está seguro? Se enviarán todos los cursos nuevos para su posterior aprobación.'
    );

    if (!confirmado) return;

    try {
      const payload = {
        periodoId,
        userId,
        estadoActual: 'nuevo',
        nuevoEstado: 'propuesto'
      };

      await this.periodosService.cambiarEstadoDecursoJefe(payload);
      this.toastr.success('Cursos enviados correctamente para su aprobación');
      this.loadCursos(periodoId);
    } catch (error) {
      this.toastr.error('Error al enviar los cursos');
    }
  }


  /* Selector generico para instructor */

  instructorPage = 1;
  totalInstructores = 0;
  selectedInstructor: any = { id: 0, nombre: '', apellidos: '' };
  columns_instructor = [
    { name: 'ID', prop: 'id', width: 60 },
    { name: 'Nombre', prop: 'nombre' },
    { name: 'Apellidos', prop: 'apellidos' },
    { name: 'Email', prop: 'email' }
  ];

  async loadInstructores(filter: any = {}): Promise<void> {
    try {
      const searchValue = filter.searchValue || '';
      const res = await this.periodosService.getAllInstructores(this.instructorPage, 10, searchValue);
      this.instructores = res.data?.rows || res.rows || [];
      this.totalInstructores = res.data?.count || res.count || 0;
    } catch (error) {
      console.error('Error al cargar instructores:', error);
      this.toastr.error('Error al cargar la lista de instructores');
      this.instructores = [];
      this.totalInstructores = 0;
    }
  }

  async openSelectInstructorModal(tipo: 'uno' | 'dos'): Promise<void> {
    const nameControl = tipo === 'uno' ? 'instructorName' : 'instructorDosName';
    const idControl = tipo === 'uno' ? 'instructorId' : 'instructorDosId';
    const search = this.cursoForm.get(nameControl)?.value || '';
    const filter = { searchValue: search };

    await this.loadInstructores(filter);

    const modalRef = this.modalService.open(GenericSelectorComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    modalRef.componentInstance.rows = this.instructores;
    modalRef.componentInstance.columns = this.columns_instructor;
    modalRef.componentInstance.total = this.totalInstructores;
    modalRef.componentInstance.page = this.instructorPage;
    modalRef.componentInstance.selector = 'single';
    modalRef.componentInstance.title = tipo === 'uno' ? 'Seleccionar Primer Instructor' : 'Seleccionar Segundo Instructor';
    modalRef.componentInstance.showSearchIcon = true;
    modalRef.componentInstance.btnRefresh = true;
    modalRef.componentInstance.initSearch = filter.searchValue;

    modalRef.componentInstance.filter.subscribe(async (newFilter: any) => {
      await this.loadInstructores(newFilter);
      modalRef.componentInstance.rows = this.instructores;
      modalRef.componentInstance.total = this.totalInstructores;
    });

    modalRef.componentInstance.selected.subscribe((selected: any) => {
      this.onInstructorSelected(selected, tipo);
    });
  }

  // Método para manejar la selección de un instructor
  onInstructorSelected(instructores: any, tipo: 'uno' | 'dos' = 'uno'): void {
    if (instructores && instructores.length > 0) {
      const instructor = instructores[0];
      if (tipo === 'uno') {
        this.selectedInstructor = {
          id: instructor.id,
          nombre: instructor.nombre,
          apellidos: instructor.apellidos
        };
        this.cursoForm.patchValue({
          instructorName: `${instructor.nombre} ${instructor.apellidos}`,
          instructorId: instructor.id
        });
      } else {
        this.cursoForm.patchValue({
          instructorDosName: `${instructor.nombre} ${instructor.apellidos}`,
          instructorDosId: instructor.id
        });
      }
    }
  }

  // Método para limpiar el instructor seleccionado
  clearInstructor(tipo: 'uno' | 'dos' = 'uno'): void {
    if (tipo === 'uno') {
      this.selectedInstructor = { id: 0, nombre: '', apellidos: '' };
      this.cursoForm.patchValue({
        instructorName: '',
        instructorId: ''
      });
      this.cursoForm.get('instructorId')?.markAsTouched();
    } else {
      this.cursoForm.patchValue({
        instructorDosName: '',
        instructorDosId: null
      });
      this.cursoForm.get('instructorDosId')?.markAsTouched();
    }
  }


  async exportarCursosPdf() {
    try {
      const filters = this.mapTableFiltersToApi(this.genericTable?.getFilter?.() || {});
      filters.periodoId = this.periodo?.id;

      const blob = await this.periodosService.exportarCursosPdf(filters);
      const url = window.URL.createObjectURL(blob);

      // Usa solo el nombre del periodo, sin "cursos" y sin guiones bajos
      const nombrePeriodo = (this.periodo?.nombre || 'PERIODO').toUpperCase().replace(/_/g, '').replace(/\s+/g, ' ');
      const fileName = `${nombrePeriodo}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      this.toastr.success(`Se ha descargado correctamente el archivo ${fileName}`, 'Éxito');
    } catch (error) {
      this.toastr.error('Error al exportar cursos a PDF', 'Error');
    }
  }

  async exportarCursosExcel() {
    try {
      const filters = this.mapTableFiltersToApi(this.genericTable?.getFilter?.() || {});
      filters.periodoId = this.periodo?.id;

      const blob = await this.periodosService.exportarCursosExcel(filters);
      const url = window.URL.createObjectURL(blob);

      // Usa solo el nombre del periodo, sin "cursos" y sin guiones bajos
      const nombrePeriodo = (this.periodo?.nombre || 'PERIODO').toUpperCase().replace(/_/g, '').replace(/\s+/g, ' ');
      const fileName = `${nombrePeriodo}.xlsx`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      this.toastr.success(`Se ha descargado correctamente el archivo ${fileName}`, 'Éxito');
    } catch (error) {
      this.toastr.error('Error al exportar cursos a Excel', 'Error');
    }
  }
  @ViewChild('importExcelModal') importExcelModal: any;
  @ViewChild('excelInput') excelInput!: ElementRef<HTMLInputElement>;
  selectedExcelFile: File | null = null;

  openImportExcelModal() {
    this.selectedExcelFile = null;
    if (this.excelInput) this.excelInput.nativeElement.value = '';
    this.modalService.open(this.importExcelModal, {
      centered: true,
      size: 'md',
      backdrop: 'static'
    });
  }

  onExcelFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      this.selectedExcelFile = file;
    } else {
      this.selectedExcelFile = null;
      this.toastr.error('Solo se permiten archivos Excel (.xlsx)', 'Error');
    }
  }

  async confirmarImportarExcel(modal: any) {
    if (!this.selectedExcelFile) {
      this.toastr.error('Selecciona un archivo Excel válido.', 'Error');
      return;
    }
    try {
      await this.periodosService.importarCursosExcel(this.selectedExcelFile);
      this.toastr.success('Importación exitosa.', 'Éxito');
      await this.loadCursos(this.periodo.id);
      modal.dismiss();
    } catch (error) {
      this.toastr.error('Error al importar el archivo Excel.', 'Error');
      modal.dismiss();
    }
  }

}
