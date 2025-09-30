import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GenericTableComponent } from '../../component/generic-table/generictable.component';
import { CursosService } from '../cursos.service';
import { CommonModule } from '@angular/common';
import { GenericSelectorComponent } from '../../component/generic-selector/genericselector.component';
import { PeriodosService } from '../../periodo/periodo.service';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.scss',
  imports: [GenericTableComponent, ReactiveFormsModule, CommonModule],
  providers: [CursosService, PeriodosService]
})
export class CursosComponent implements OnInit {
  @ViewChild('cursoModal') cursoModal: any;

  cursos: any[] = [];
  totalItems = 0;
  page = 1;
  limit = 10;
  filters: any = {};
  editingCurso: any = null;

  // Listas para los selectores
  academias: any[] = [];
  instructores: any[] = [];
  periodos: any[] = [];

  columns = [
    { name: 'Nombre', prop: 'nombre', filter: true },
    { name: 'Academia', prop: 'academiaNombre', filter: true },
    { name: 'Instructor', prop: 'instructorNombre', filter: true },
    { name: 'Periodo', prop: 'periodoNombre', filter: true },
    { name: 'Lugar', prop: 'lugar', filter: true },
    { name: 'Aula', prop: 'aula', filter: true },
    { name: 'Fecha inicio', prop: 'fecha_inicio', filter: true },
    { name: 'Fecha fin', prop: 'fecha_fin', filter: true },
    {
      prop: 'action', name: 'Acción', width: 40, actions: [
        { name: 'Editar', icon: 'edit', action: (value, row) => this.onEdit(row) },
        { name: 'Eliminar', icon: 'trash', action: (value, row) => this.onDelete(row) }
      ]
    }
  ];

  form: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    objetivo: ['', Validators.required],
    periodoId: ['', Validators.required],
    academiaId: ['', Validators.required],
    instructorId: ['', Validators.required],
    instructorName: [''],
    lugar: ['', Validators.required],
    aula: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    hora_inicio: ['', Validators.required],
    hora_fin: ['', Validators.required],
    horas: ['', Validators.required],
    dirigido_a: ['', Validators.required],
    prerequisitos: [''],
    estado: ['propuesto', Validators.required],
    comentario_rechazo: ['']
  });

  constructor(
    private cursosService: CursosService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private periodosService: PeriodosService
  ) { }

  ngOnInit() {
    this.getCursos();
    this.loadFormData();

    // Agregar validación condicional para comentario_rechazo
    this.form.get('estado')?.valueChanges.subscribe(estado => {
      const comentarioRechazoControl = this.form.get('comentario_rechazo');
      if (estado === 'rechazado') {
        comentarioRechazoControl?.setValidators(Validators.required);
      } else {
        comentarioRechazoControl?.clearValidators();
      }
      comentarioRechazoControl?.updateValueAndValidity();
    });
  }

  async loadFormData() {
    try {
      // Cargar academias
      const res = await this.cursosService.getAllAcademias(1, 50).toPromise();
      this.academias = res.data?.rows || [];

      // Cargar instructores
      await this.loadInstructores({});

      // Cargar periodos usando PeriodosService (traer muchos para el select)
      const resPeriodos: any = await this.periodosService.getAllPeriodos(1, 1000, {});
      this.periodos = resPeriodos.data?.rows || resPeriodos.rows || resPeriodos || [];

      // Normalizar id (asegura que [ngValue]="p.id || p.periodoId" funcione)
      this.periodos.forEach((p: any) => {
        if (!p.id) {
          if (p.periodoId) p.id = p.periodoId;
          else if (p.id === undefined && p._id) p.id = p._id;
        }
      });

    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
      this.toastr.error('Error al cargar datos necesarios para el formulario');
    }
  }

  async getCursos() {
    try {
      const result = await this.cursosService.getAllCursos(this.page, this.limit, this.filters);
      console.log('Resultado:', result);
      if (result && Array.isArray(result.rows)) {
        this.cursos = this.handleResponse(result.rows);
        this.totalItems = result.count;
      } else {
        console.error('Estructura de respuesta inesperada:', result);
      }
    } catch (error) {
      console.error('Error al obtener cursos:', error);
    }
  }

  async applyFilter(filter: any = {}): Promise<void> {
    this.filters = filter;
    this.page = 1;
    try {
      const response = await this.cursosService.getAllCursos(this.page, this.limit, filter);

      if (response && Array.isArray(response.rows)) {
        this.cursos = this.handleResponse(response.rows);
        this.totalItems = response.count;
      } else {
        console.error('Estructura de respuesta inesperada:', response);
      }
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    }
  }

  handleResponse(response): any[] {
    return response.map((item) => ({
      ...item,
      academiaNombre: item.academia?.nombre || '',
      instructorNombre: item.instructor ? `${item.instructor.nombre} ${item.instructor.apellidos}` : '',
      periodoNombre: item.periodo?.nombre || '',
      fecha_inicio: item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : '',
      fecha_fin: item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : ''
    }));
  }

  openCursoModal(curso?: any) {
    if (curso) {
      this.form.reset();
      this.form.patchValue({
        id: curso.id,
        nombre: curso.nombre,
        objetivo: curso.objetivo,
        periodoId: curso.periodoId,
        academiaId: curso.academiaId,
        instructorId: curso.instructorId,
        lugar: curso.lugar,
        aula: curso.aula,
        fecha_inicio: curso.fecha_inicio,
        fecha_fin: curso.fecha_fin,
        hora_inicio: curso.hora_inicio,
        hora_fin: curso.hora_fin,
        horas: curso.horas,
        estado: curso.estado,
        dirigido_a: curso.dirigido_a || '',
        prerequisitos: curso.prerequisitos || '',
        comentario_rechazo: curso.comentario_rechazo || ''
      });
      this.editingCurso = curso;
    } else {
      this.form.reset();
      this.form.patchValue({
        estado: 'propuesto',
        hora_inicio: '08:00',
        hora_fin: '14:00'
      });
      this.editingCurso = null;
    }
    this.modalService.open(this.cursoModal, { centered: true, size: 'lg' });
  }

  closeCursoModal() {
    this.modalService.dismissAll();
    this.editingCurso = null;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toastr.error('Por favor complete todos los campos requeridos');
      return;
    }

    const cursoData = this.form.value;
    try {
      if (cursoData.id) {
        await this.cursosService.updateCurso(cursoData.id, cursoData);
        this.toastr.success('Curso actualizado');
      } else {
        await this.cursosService.createCurso(cursoData);
        this.toastr.success('Curso agregado');
      }
      this.closeCursoModal();
      this.getCursos();
    } catch (err) {
      this.toastr.error('Error al guardar curso');
    }
  }

  onDelete(row: any) {
    if (confirm('¿Seguro que deseas eliminar este curso?')) {
      this.cursosService.deleteCurso(row.id).then(() => {
        this.toastr.success('Curso eliminado');
        this.getCursos();
      });
    }
  }

  onEdit(curso: any) {
    this.openCursoModal(curso);
  }

  /* Selector generico para instructor */

  instructorPage = 1;
  totalInstructores = 0;
  selectedInstructor: any = { id: 0, nombre: '', apellidos: '' }; Í
  columns_instructor = [
    { name: 'ID', prop: 'id', width: 60 },
    { name: 'Nombre', prop: 'nombre' },
    { name: 'Apellidos', prop: 'apellidos' },
    { name: 'Email', prop: 'email' }
  ];

  async loadInstructores(filter: any = {}): Promise<void> {
    try {
      const searchValue = filter.searchValue || '';
      const res = await this.cursosService.getAllInstructores(this.instructorPage, 10, searchValue);
      this.instructores = res.data?.rows || res.rows || [];
      this.totalInstructores = res.data?.count || res.count || 0;
    } catch (error) {
      console.error('Error al cargar instructores:', error);
      this.toastr.error('Error al cargar la lista de instructores');
      this.instructores = [];
      this.totalInstructores = 0;
    }
  }

  async openSelectInstructorModal(): Promise<void> {
    const search = this.form.get('instructorName')?.value || '';
    const filter = { searchValue: search };

    // Cargar instructores con el filtro actual
    await this.loadInstructores(filter);

    // Abrir el modal con el componente selector genérico
    const modalRef = this.modalService.open(GenericSelectorComponent, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });

    // Configurar el componente
    modalRef.componentInstance.rows = this.instructores;
    modalRef.componentInstance.columns = this.columns_instructor;
    modalRef.componentInstance.total = this.totalInstructores;
    modalRef.componentInstance.page = this.instructorPage;
    modalRef.componentInstance.selector = 'single';
    modalRef.componentInstance.title = 'Seleccionar Instructor';
    modalRef.componentInstance.showSearchIcon = true;
    modalRef.componentInstance.btnRefresh = true;
    modalRef.componentInstance.initSearch = filter.searchValue;

    // Suscribirse al evento de filtro
    modalRef.componentInstance.filter.subscribe(async (newFilter: any) => {
      await this.loadInstructores(newFilter);

      // Actualizar la tabla con los nuevos datos
      modalRef.componentInstance.rows = this.instructores;
      modalRef.componentInstance.total = this.totalInstructores;
    });

    // Suscribirse al evento de selección
    modalRef.componentInstance.selected.subscribe((selected: any) => {
      this.onInstructorSelected(selected);
    });
  }

  // Método para manejar la selección de un instructor
  onInstructorSelected(instructores: any): void {
    if (instructores && instructores.length > 0) {
      const instructor = instructores[0];

      // Guardar el instructor seleccionado
      this.selectedInstructor = {
        id: instructor.id,
        nombre: instructor.nombre,
        apellidos: instructor.apellidos
      };

      // Actualizar el formulario
      this.form.patchValue({
        instructorName: `${instructor.nombre} ${instructor.apellidos}`,
        instructorId: instructor.id
      });
    }
  }

  // Método para limpiar el instructor seleccionado
  clearInstructor(): void {
    this.selectedInstructor = { id: 0, nombre: '', apellidos: '' };
    this.form.patchValue({
      instructorName: '',
      instructorId: ''
    });
    this.form.get('instructorId')?.markAsTouched();
  }
}