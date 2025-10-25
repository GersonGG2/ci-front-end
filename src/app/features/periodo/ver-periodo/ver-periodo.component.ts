import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeriodosService } from '../periodo.service';
import { CursosService } from '../../cursos/cursos.service';
import { GenericTableComponent } from "../../component/generic-table/generictable.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Alert } from 'src/app/helpers/alerts';

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
    if (this.isAdmin) {
      defaultEstado = 'propuesto';
    } else if (this.isJefe) {
      defaultEstado = 'nuevo';
    } else if (this.isInstructor) {
      defaultEstado = 'aprobado';
    } else if (this.isDocente) {
      defaultEstado = 'aprobado';
    }

    this.columns = [
      ...(this.isAdmin ? [{
        prop: 'id', name: '#', filter: false, checkbox: true, width: 30, sortable: false,
      }] : []),
      { name: 'Nombre', prop: 'nombre', customView: 'nombreHtml', filter: true },
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
          { name: 'Ver detalle', icon: 'eye', action: (value, row) => this.verDetalleCurso(row) },
          { name: 'Editar', icon: 'edit', action: (value, row) => this.openCursoModal(row, 'edit') },
          { name: 'Copiar', icon: 'copy', action: (value, row) => this.openCursoModal(row, 'copy') },
          { name: 'Eliminar', icon: 'trash', action: (value, row) => this.doDeleteCurso(row) }
        ]
      }] : [{
        prop: 'action', name: 'Acción', width: 40, actions: [
          { name: 'Ver detalle', icon: 'eye', action: (value, row) => this.verDetalleCurso(row) }
        ]
      }])
    ];
  }

  props = [
    { prop: 'Cambiar estatus', name: 'Cambiar estatus', icon: 'sync', action: () => this.openChangeStatusModal() },
    { prop: 'Eliminar', name: 'Eliminar', icon: 'trash', action: () => this.openDeleteCursoModal() }
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
      instructorId: ['', Validators.required],
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

  ngOnInit() {
    this.route.params.subscribe(async params => {
      const id = params['id'];
      // Primero carga el periodo
      await this.loadPeriodo(id);
      // Luego carga los cursos después de que la función anterior terminó
      await this.loadCursos(id);
      // Finalmente carga otros datos del formulario
      this.loadFormData();
    });
  }

  verCurso(row: any) {
    this.router.navigate(['/periodo/cursos/docentes', row.id]);
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
      this.updateColumns();
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
      const nombreHtml = `<a class="link-action text-primary href-/periodo/cursos/docentes/${item.id}">${item.nombre}</a>`;

      const academiaHtml = item.academia
        ? `<span>${item.academia.nombre}</span>`
        : `<span class="text-muted">Sin academia</span>`;
      const instructorHtml = item.instructor
        ? `<span>${item.instructor.nombre} ${item.instructor.apellidos}</span>`
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
        estado: this.isJefe ? 'nuevo' : curso.estado // <--- fuerza propuesto si es jefe
      });
    } else if (curso && mode === 'copy') {
      const { id, ...rest } = curso;
      this.cursoForm.reset({
        ...rest,
        periodoId: this.periodo.id,
        fecha_inicio: curso.fecha_inicio || this.periodo.fecha_inicio,
        fecha_fin: curso.fecha_fin || this.periodo.fecha_fin,
        estado: this.isJefe ? 'nuevo' : rest.estado // <--- fuerza propuesto si es jefe
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
        tipo: ''
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
    this.router.navigate(['/periodo/cursos/docentes', curso.id]);
  }

  openChangeStatusModal(row?: any) {
    // Aquí abre tu modal para cambiar el estatus
    // Puedes guardar el curso seleccionado en una variable y mostrar el modal
    this.selectedCurso = row;
    this.modalService.open(this.changeStatusModal, {
      centered: true,
      size: 'md',
      backdrop: 'static'
    });
  }

  openDeleteCursoModal(row?: any) {
    // Aquí abre tu modal de confirmación para eliminar
    this.selectedCurso = row;
    this.modalService.open(this.deleteCursoModal, {
      centered: true,
      size: 'md',
      backdrop: 'static'
    });
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

  async aprobarSeleccionados() {
    if (!this.selectedIds || this.selectedIds.length === 0) {
      this.toastr.error('Selecciona al menos un curso');
      return;
    }
    try {
      await this.periodosService.aprobarMultiplesCursos(this.selectedIds, this.nuevoEstado);
      this.toastr.success('Cursos actualizados correctamente');
      this.loadCursos(this.periodo.id);
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
}
