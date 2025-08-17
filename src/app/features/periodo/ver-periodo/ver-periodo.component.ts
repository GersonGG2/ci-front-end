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

  // Listas para los selectores
  academias: any[] = [];
  instructores: any[] = [];

  // Formulario para el nuevo curso
  cursoForm: FormGroup;

  columns = [
    {
      prop: 'id', name: '', filter: false, checkbox: true, width: 30, sortable: false,
      //selected: (rows: any) => console.log('row', rows),
    },
    { name: 'Nombre', prop: 'nombre', customView: 'nombreHtml', filter: true },
    { name: 'Objetivo', prop: 'objetivo', filter: true },
    { name: 'Academia', prop: 'academiaNombre', customView: 'academiaHtml', filter: true },
    { name: 'Instructor', prop: 'instructorNombre', customView: 'instructorHtml', filter: false },
    {
      name: 'Estado', prop: 'estado', customView: 'estadoHtml', filter: true, sortable: false, type: 'select', options: [
        { value: 'propuesto', text: 'Propuesto' },
        { value: 'aprobado', text: 'Aprobado' },
        { value: 'finalizado', text: 'Finalizado' }
      ]
    },
    {
      prop: 'action', name: 'Acción', width: 40, actions: [
        { name: 'Ver detalle', icon: 'eye', action: (value, row) => this.verDetalleCurso(row) },
        { name: 'Editar', icon: 'edit', action: (value, row) => this.openCursoModal(row, 'edit') },
        { name: 'Copiar', icon: 'copy', action: (value, row) => this.openCursoModal(row, 'copy') },
        { name: 'Eliminar', icon: 'trash', action: (value, row) => this.doDeleteCurso(row) } // <-- agrega esto

      ]
    }
  ];

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
      estado: ['propuesto']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.loadPeriodo(id);
      this.loadCursos(id);
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

      // Actualizar el formulario con el ID del periodo
      this.cursoForm.patchValue({
        periodoId: this.periodo.id
      });
    } catch (error) {
      console.error('Error al cargar periodo:', error);
      this.periodo = null;
      this.toastr.error('Error al cargar datos del periodo');
    }
  }

  async loadCursos(periodoId: string) {
    try {
      console.log('Cargando cursos para periodoId:', periodoId);
      const res = await this.periodosService.getAllCursos(this.page, this.limit, { periodoId });

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
      console.error('Error al cargar cursos:', error);
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

      this.instructores = [
        { id: 1, nombre: 'Juan Carlos', apellidos: 'García Pérez' },
        { id: 4, nombre: 'Gerson Yahir', apellidos: 'García Gonzalez' },
        { id: 5, nombre: 'María', apellidos: 'López Sánchez' }
      ];
    } catch (error) {
      console.error('Error al cargar datos del formulario:', error);
    }
  }

  handleCursosResponse(response: any[]): any[] {
    return response.map(item => {
      const estadoHtml =
        item.estado === 'propuesto'
          ? `<span class="badge bg-warning text-dark">Propuesto</span>`
          : item.estado === 'aprobado'
            ? `<span class="badge bg-success text-white">Aprobado</span>`
            : item.estado === 'finalizado'
              ? `<span class="badge bg-info text-white">Finalizado</span>`
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
      // Editar
      this.cursoForm.reset({
        id: curso.id,
        ...curso,
        periodoId: this.periodo.id,
        fecha_inicio: curso.fecha_inicio || this.periodo.fecha_inicio,
        fecha_fin: curso.fecha_fin || this.periodo.fecha_fin
      });
    } else if (curso && mode === 'copy') {
      // Copiar (sin id)
      const { id, ...rest } = curso;
      this.cursoForm.reset({
        ...rest,
        periodoId: this.periodo.id,
        fecha_inicio: curso.fecha_inicio || this.periodo.fecha_inicio,
        fecha_fin: curso.fecha_fin || this.periodo.fecha_fin
      });
    } else {
      // Nuevo
      this.cursoForm.reset({
        periodoId: this.periodo.id,
        estado: 'propuesto',
        horas: '',
        hora_inicio: '',
        hora_fin: '',
        fecha_inicio: this.periodo.fecha_inicio,
        fecha_fin: this.periodo.fecha_fin
      });
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
      const cursoData = {
        ...raw,
        academiaId: Number(raw.academiaId),
        instructorId: Number(raw.instructorId),
        createdBy: 1
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
}
