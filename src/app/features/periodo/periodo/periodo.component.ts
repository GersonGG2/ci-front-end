import { Component, ViewChild } from '@angular/core';
import { GenericTableComponent } from "../../component/generic-table/generictable.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PeriodosService } from '../periodo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { PeriodosSocketService } from '../periodos-socket.service';

@Component({
  selector: 'app-periodo',
  imports: [GenericTableComponent, ReactiveFormsModule],
  templateUrl: './periodo.component.html',
  styleUrl: './periodo.component.scss',
  providers: [PeriodosService],
})
export class PeriodoComponent {
  @ViewChild('periodoModal') periodoModal: any;
  socketSub: any;
  constructor(
    private periodosService: PeriodosService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    private periodosSocket: PeriodosSocketService
  ) {
    this.form = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      estado: ['activo', Validators.required]
    });
  }

  rows: any[] = [];
  totalItems: number = 0;
  page: number = 1;
  limit: number = 10;
  filters: any = {};
  editingPeriodo: any = null;

  isAdmin: boolean = false;
  columns: any[] = [];
  form: FormGroup;

  ngOnInit() {
    this.getPeriodos();
    this.socketSub = this.periodosSocket.onPeriodoAperturado().subscribe((periodo) => {
      this.toastr.warning(
        `Se ha aperturado el periodo: "${periodo.nombre}".`,
        'Nuevo periodo aperturado'
      );
      this.getPeriodos();
    });
  }

  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
  buildColumns() {
    this.columns = [
      { name: 'Nombre', prop: 'periodo.nombre', customView: 'nombreHtml', filter: true },
      { name: 'Fecha inicio', prop: 'periodo.fecha_inicio', customView: 'fechaInicioHtml', filter: true, type: 'date' },
      { name: 'Fecha fin', prop: 'periodo.fecha_fin', customView: 'fechaFinHtml', filter: true, type: 'date' },
      {
        name: 'Estado', prop: 'periodo.estado', filter: true, customView: 'estadoHtml', type: 'select', options: [
          { value: 'activo', text: 'Activo' },
          { value: 'cerrado', text: 'Cerrado' },
          { value: 'inactivo', text: 'Inactivo' }
        ]
      },
      // { name: 'Usuario', prop: 'usuarioNombre', filter: false },
      ...(this.isAdmin ? [{
        prop: 'action', name: 'Acción', width: 40, actions: [
          { name: 'Editar', icon: 'edit', action: (value, row) => this.onEdit(row) },
          { name: 'Eliminar', icon: 'trash', action: (value, row) => this.onDelete(row) }
        ]
      }] : [])
    ];
  }

  async getPeriodos() {
    let result = await this.periodosService.getAllPeriodos(this.page, this.limit, this.filters);
    this.rows = this.handleResponse(result.data.rows);
    this.totalItems = result.data.count;
    this.isAdmin = result.isAdmin;
    this.buildColumns();
  }

  async applyFilter(filter: any = {}): Promise<void> {
    this.filters = filter;
    this.page = 1;
    try {
      const response = await this.periodosService.getAllPeriodos(this.page, this.limit, filter);
      if (response && response.data && Array.isArray(response.data.rows)) {
        this.rows = this.handleResponse(response.data.rows);
        this.totalItems = response.data.count;
      }
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    }
  }

  handleResponse(response): any[] {
    return response.map((item) => {
      // Estado con estilos=
      let estadoHtml = '';
      if (item.estado === 'activo') {
        estadoHtml = `<span class="badge bg-success text-white"><i class="mdi mdi-check"></i> Activo</span>`;
      } else if (item.estado === 'cerrado') {
        estadoHtml = `<span class="badge bg-danger text-white"><i class="mdi mdi-close"></i> Cerrado</span>`;
      } else if (item.estado === 'inactivo') {
        estadoHtml = `<span class="badge bg-secondary text-white"><i class="mdi mdi-minus-circle"></i> Inactivo</span>`;
      } else {
        estadoHtml = `<span class="badge bg-secondary text-white">${item.estado}</span>`;
      }

      // Usuario
      const usuarioHtml = item.usuario
        ? `<span>${item.usuario.nombre} ${item.usuario.apellidos} <br><small>${item.usuario.email}</small></span>`
        : `<span class="text-muted">Sin usuario</span>`;

      // Fechas
      const fechaInicioHtml = `<span>${item.fecha_inicio}</span>`;
      const fechaFinHtml = `<span>${item.fecha_fin}</span>`;
      // const nombreHtml = `<span>${item.nombre}</span>`;
      // const nombreHtml = `<a class="link-action text-primary href+/periodo/detail/${item.id}">${item.nombre}</a>`;
      // const nombreHtml = `<a class="link-action text-primary" href="/periodo/detail/${item.id}">${item.nombre}</a>`;
      const nombreHtml = `<a class="link-action text-primary href-/periodo/cursos/${item.id}">${item.nombre}</a>`;



      return {
        ...item,
        estadoHtml,
        usuarioHtml,
        fechaInicioHtml,
        fechaFinHtml,
        nombreHtml,
        usuarioNombre: item.usuario ? `${item.usuario.nombre} ${item.usuario.apellidos}` : ''
      };
    });
  }

  openPeriodoModal(periodo?: any) {
    if (periodo) {
      this.form.reset();
      this.form.patchValue({
        id: periodo.id,
        nombre: periodo.nombre,
        fecha_inicio: periodo.fecha_inicio,
        fecha_fin: periodo.fecha_fin,
        estado: periodo.estado
      });
      this.editingPeriodo = periodo;
    } else {
      this.form.reset();
      this.form.patchValue({ estado: 'activo' });
      this.editingPeriodo = null;
    }
    this.modalService.open(this.periodoModal, { centered: true });
  }

  closePeriodoModal() {
    this.modalService.dismissAll();
    this.editingPeriodo = null;
  }

  async onSubmit() {
    if (this.form.invalid) return;
    const { id, nombre, fecha_inicio, fecha_fin, estado } = this.form.value;
    try {
      if (id) {
        await this.periodosService.updatePeriodo(id, { nombre, fecha_inicio, fecha_fin, estado });
        this.toastr.success('Periodo actualizado');
      } else {
        // SIEMPRE obtener el usuario logueado aquí
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const usuarioId = user.id;

        // NO uses ningún usuarioId del formulario ni del objeto periodo
        await this.periodosService.createPeriodo({ nombre, fecha_inicio, fecha_fin, estado, usuarioId });
        this.toastr.success('Periodo agregado');
      }
      this.closePeriodoModal();
      this.getPeriodos();
    } catch (err) {
      this.toastr.error('Error al guardar periodo');
    }
  }

  async onDelete(row: any) {
    if (row.estado === 'activo') {
      this.toastr.error('No puedes eliminar un periodo con estado "Activo".');
      return;
    }
    // Usando window.confirm como alerta genérica
    const confirmado = window.confirm('¿Estás seguro que deseas eliminar este periodo? Esta acción no se puede deshacer.');
    if (!confirmado) return;
  
    try {
      await this.periodosService.deletePeriodo(row.id);
      this.toastr.success('Periodo eliminado');
      this.getPeriodos();
    } catch (error) {
      this.toastr.error('Error al eliminar el periodo');
    }
  }

  onEdit(periodo: any) {
    this.openPeriodoModal(periodo);
  }
}
