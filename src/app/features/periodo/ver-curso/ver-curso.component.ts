import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PeriodosService } from '../periodo.service';
import { GenericTableComponent } from "../../component/generic-table/generictable.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GenericSelectorComponent } from '../../component/generic-selector/genericselector.component';
import jsPDF from 'jspdf';
import { Alert } from 'src/app/helpers/alerts';

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

  isAdmin: boolean = false;
  isJefe: boolean = false;
  isDocente: boolean = false;
  isInscrito: boolean = false;
  isInstructorDelCurso: boolean = false;
  currentUserId: number = 0;

  columns = [
    { name: 'Docente', prop: 'docenteNombre', filter: true },
    { name: 'Email', prop: 'docenteEmail', filter: true },
    { name: 'Estado inscripción', prop: 'estadoHtml', customView: 'estadoHtml', filter: true },
    { name: 'Fecha inscripción', prop: 'fechaInscripcion', filter: false },
    {
      name: 'ACCIÓN',
      prop: 'action',
      frozenRight: true,
      validate: (value, row) => this.filterOptions(value, row),
      actions: [
        { name: 'Descargar constancia', icon: 'file', action: (value, row) => this.descargarConstancia(row) },
        { name: 'Cambiar estado', icon: 'edit', action: (value, row) => this.changeStatus(row) },
        { name: 'Remover del curso', icon: 'trash', action: (value, row) => this.removeInscripcion(row) }
      ]
    }
  ];

  filterOptions(option, row) {
    if (option.name === 'Cambiar estado') {
      // ✅ Solo pueden cambiar estado:
      // 1. Admin
      // 2. Jefe
      // 3. Instructor del curso (y NO estar inscrito como participante)

      if (this.isAdmin || this.isJefe) {
        return true;
      }

      // 🔥 Verificar si es instructor del curso Y NO está inscrito
      if (this.isInstructorDelCurso && !this.isInscrito) {
        return true;
      }

      return false;
    }

    if (option.name === 'Remover del curso') {
      // Obtener el docenteId de la fila actual
      const inscripcion = this.inscripciones.find(i => i.id === row.id);
      const docenteIdRow = inscripcion?.docenteId || row.docenteId;

      // ❌ Nadie puede removerse a sí mismo
      if (docenteIdRow === this.currentUserId) {
        return false;
      }

      // ✅ Solo pueden remover:
      // 1. Admin
      // 2. Jefe
      // 3. Instructor del curso (y NO estar inscrito como participante)

      if (this.isAdmin || this.isJefe) {
        return true;
      }

      // 🔥 Verificar si es instructor del curso Y NO está inscrito
      if (this.isInstructorDelCurso && !this.isInscrito) {
        return true;
      }

      return false;
    }

    if (option.name === 'Descargar constancia') {
      // Si el usuario está inscrito, solo puede ver la constancia si está aprobado
      if (this.isInscrito) {
        // Verificar si es su propia inscripción
        const inscripcion = this.inscripciones.find(i => i.id === row.id);
        const docenteIdRow = inscripcion?.docenteId || row.docenteId;

        // Solo puede descargar su propia constancia si está aprobado
        if (docenteIdRow === this.currentUserId) {
          return row.estado === 'aprobado';
        }
        // No puede ver constancias de otros
        return false;
      }

      // ✅ Admin, Jefe o Instructor pueden descargar constancias aprobadas
      if (this.isAdmin || this.isJefe || this.isInstructorDelCurso) {
        return row.estado === 'aprobado';
      }

      return false;
    }

    return false;
  }

  estados = [
    { value: 'inscrito', text: 'Inscrito' },
    { value: 'aprobado', text: 'Aprobado' },
    { value: 'reprobado', text: 'Reprobado' },
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
    private router: Router,
    private periodosService: PeriodosService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.inscripcionForm = this.fb.group({
      cursoId: [{ value: '', disabled: true }, Validators.required],
      docenteId: ['', Validators.required],
      docenteNombre: [{ value: '' }],
      estado: ['inscrito', Validators.required]
    });
  }

  async ngOnInit() {
    const periodoId = this.route.snapshot.params['periodoId'];
    const cursoId = this.route.snapshot.params['id'];

    // 🔥 Obtener el ID del usuario logueado AL INICIO
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.id;

    this.curso = await this.periodosService.getCursoById(cursoId);

    this.isAdmin = this.curso?.isAdmin ?? false;
    this.isJefe = this.curso?.isJefe ?? false;
    this.isDocente = this.curso?.isDocente ?? false;

    // 👇 Validar si el usuario es instructor del curso
    this.isInstructorDelCurso =
      this.curso?.instructorId === this.currentUserId ||
      this.curso?.instructorDosId === this.currentUserId;

    console.log('🔍 Validaciones de usuario:', {
      currentUserId: this.currentUserId,
      instructorId: this.curso?.instructorId,
      instructorDosId: this.curso?.instructorDosId,
      isInstructorDelCurso: this.isInstructorDelCurso,
      isAdmin: this.isAdmin,
      isJefe: this.isJefe,
      isDocente: this.isDocente
    });

    this.inscripcionForm.patchValue({ cursoId: this.curso.id });

    // 🔥 Verificar inscripción para TODOS los usuarios
    await this.checkInscripcion();

    await this.loadInscripciones(cursoId);

    console.log('✅ Estado final - isInscrito:', this.isInscrito, 'isInstructorDelCurso:', this.isInstructorDelCurso);
  }

  // Método para verificar si el docente ya está inscrito
  async checkInscripcion() {
    try {
      console.log('🔍 Verificando inscripción para curso:', this.curso.id);

      // Obtener el ID del usuario actual del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = user.id;
      console.log('👤 ID del usuario actual:', currentUserId);

      if (!currentUserId) {
        console.error('❌ No se encontró el ID del usuario');
        this.isInscrito = false;
        return;
      }

      // Llamar al nuevo endpoint de verificación
      const result = await this.periodosService.verificarInscripcion(this.curso.id, currentUserId);

      console.log('📋 Resultado de verificación:', result);

      // Verificar si está inscrito según la respuesta del backend
      if (result.inscrito === true) {
        // Si inscrito es true, verificar que el usuario coincida
        if (result.inscripcion) {
          // Verificar que el docenteId de la inscripción coincida con el usuario actual
          this.isInscrito = result.inscripcion.docenteId === currentUserId;
          console.log('✅ Inscripción encontrada para el usuario actual');
        } else {
          this.isInscrito = true;
          console.log('✅ Usuario inscrito (sin detalles de inscripción)');
        }
      } else if (result.inscrito === false) {
        // Si inscrito es false, puede haber un objeto con inscripción de otro usuario
        if (result.inscripcion && result.inscripcion.docenteId === currentUserId) {
          // Si hay inscripción y coincide el docenteId, está inscrito
          this.isInscrito = true;
          console.log('✅ Inscripción encontrada en objeto anidado');
        } else {
          // No está inscrito
          this.isInscrito = false;
          console.log('❌ Usuario NO inscrito');
        }
      } else {
        // Valor inesperado
        this.isInscrito = false;
        console.log('⚠️ Valor inesperado de inscrito:', result.inscrito);
      }

      console.log('✅ Estado final isInscrito:', this.isInscrito);
    } catch (error) {
      console.error('❌ Error al verificar inscripción:', error);
      this.isInscrito = false;
    }
  }

  async inscribirDocente() {
    try {
      // 🔥 Agregar confirmación antes de inscribirse
      const confirmado = await Alert.question(
        'Confirmar inscripción',
        '¿Está seguro que desea inscribirse a este curso?'
      );

      if (!confirmado) return;

      // Recupera el userId del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const docenteId = user.id;

      if (!docenteId) {
        this.toastr.error('No se pudo obtener el usuario actual.');
        return;
      }

      // Validar si el usuario es instructor o instructorDos del curso
      if (this.curso?.instructorId === docenteId || this.curso?.instructorDosId === docenteId) {
        this.toastr.warning('Como instructor del curso, no puedes inscribirte como participante.');
        return;
      }

      const data = {
        cursoId: this.curso.id,
        docenteId: docenteId,
        estado: 'inscrito'
      };

      await this.periodosService.inscribirDocente(data);
      this.toastr.success('Te has inscrito correctamente al curso');
      this.isInscrito = true;

      // Recargar la lista de inscripciones
      await this.loadInscripciones(this.curso.id);
    } catch (error) {
      console.error('Error al inscribirse:', error);
      this.toastr.error('Error al inscribirse al curso');
    }
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
        docenteId: item.docenteId,
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

    // Suscríbete al evento filter para paginador y búsqueda
    modalRef.componentInstance.filter.subscribe(async (event: any) => {
      // event puede tener { page, searchValue }
      await this.loadDocentes({
        page: event.page || 1,
        limit: 10,
        searchValue: event.searchValue || ''
      });
      // Actualiza los datos del modal
      modalRef.componentInstance.rows = this.docenteList;
      modalRef.componentInstance.total = this.totalItemsDocente;
      modalRef.componentInstance.page = event.page || 1;
    });

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
    // 🔥 Validación adicional antes de cambiar estado
    if (!this.isAdmin && !this.isJefe && !(this.isInstructorDelCurso && !this.isInscrito)) {
      this.toastr.warning('No tienes permisos para cambiar el estado de inscripciones');
      return;
    }

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

      if (result && result.estado) {
        await this.periodosService.updateInscripcion({
          id: row.id,
          estado: result.estado
        });

        this.toastr.success('Estado de inscripción actualizado');
        await this.loadInscripciones(this.curso.id);
      }
    } catch (error) {
      if (error !== 'dismissed' && error !== 0 && error !== 1 && error !== 'cancel') {
        console.error('Error al cambiar el estado:', error);
        this.toastr.error('Error al cambiar el estado');
      }
    }
  }

  async removeInscripcion(row: any) {
    if (!row?.id) return;

    // 🔥 Validación adicional antes de remover
    if (!this.isAdmin && !this.isJefe && !(this.isInstructorDelCurso && !this.isInscrito)) {
      this.toastr.warning('No tienes permisos para remover inscripciones');
      return;
    }

    // ❌ Validar que no se remueva a sí mismo
    const inscripcion = this.inscripciones.find(i => i.id === row.id);
    const docenteIdRow = inscripcion?.docenteId || row.docenteId;

    if (docenteIdRow === this.currentUserId) {
      this.toastr.warning('No puedes removerte a ti mismo del curso');
      return;
    }

    // 🔥 Usar Alert genérica para confirmación
    const confirmado = await Alert.question(
      'Confirmar eliminación',
      `¿Seguro que deseas remover a ${row.docenteNombre} del curso?`
    );

    if (!confirmado) return;

    try {
      await this.periodosService.removeInscripcion(row.id);
      this.toastr.success('Docente removido del curso');
      await this.loadInscripciones(this.curso.id);
    } catch (error) {
      console.error('Error al remover inscripción:', error);
      this.toastr.error('Error al remover inscripción');
    }
  }


  descargarConstancia(row: any) {
    const doc = new jsPDF();
    const nombre = row.docenteNombre || 'Usuario';
    doc.text(`Constancia de participación`, 20, 20);
    doc.text(`Nombre: ${nombre}`, 20, 40);
    doc.save(`constancia_${nombre.replace(/\s+/g, '_')}.pdf`);
  }
}
