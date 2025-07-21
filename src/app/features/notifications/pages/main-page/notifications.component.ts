import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notificationService.service';
import { Notification } from '../../services/notification';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GenericTableComponent } from "../../../component/generic-table/generictable.component";
import { FeatherModule } from 'angular-feather';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbPaginationModule, GenericTableComponent, FeatherModule], // Importa FormsModule aquí
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [NotificationService, DatePipe]
})
export class NotificationsComponent implements OnInit {

  @ViewChild('notificationDetailModal') notificationDetailModal!: TemplateRef<any>;

  // Variables de la tabla
  rows: any[] = [];
  totalItems: number = 0;
  loadingIndicator: boolean = true;
  page: number = 1;
  limit: number = 10;
  filters: any = {};

  selectedBranchName: string = '';

  columns_notification = [
    // Filtros (actualizados según parámetros API)
    // { name: 'ID', prop: 'userId', filter: true, col: false },
    { name: 'Módulo', prop: 'module', filter: true, col: false },
    {
      name: 'Tipo',
      prop: 'type',
      filter: true,
      col: false,
      type: 'select',
      options: [
        { value: '', text: 'Todos' },
        { value: 'info', text: 'Información' },
        { value: 'success', text: 'Éxito' },
        { value: 'warning', text: 'Advertencia' },
        { value: 'error', text: 'Error' }
      ]
    },
    // Columnas de la tabla
    { name: 'ID', prop: 'id', sortable: true },
    { name: 'Módulo', prop: 'module', sortable: true },
    { name: 'Mensaje', prop: 'message', sortable: true, width: 300, },
    { name: 'Tipo', prop: 'type', sortable: true, customView: 'typeHtml' },
    // { name: 'Estado', prop: 'status', sortable: true, customView: 'statusHtml' },
    {
      name: 'Estado',
      prop: 'status',
      sortable: false,
      customView: 'statusCheckHtml',
      width: 80
    },
    { name: 'Fecha', prop: 'createdAt', sortable: true, customView: 'dateHtml' },
    { name: 'Prioridad', prop: 'priority', sortable: true, customView: 'priorityHtml' },
    {
      name: 'ACCIONES',
      prop: 'action',
      lineal: true,
      width: 120,
      actions: [
        {
          name: 'eye',
          icon: 'eye',
          color: 'btn-warning',
          validate: (prop, row) => true,
          action: (value, row) => this.viewDetailNotification(row)
        },
      ]
    }
  ];


  constructor(
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private datePipe: DatePipe,
  ) { }


  ngOnInit(): void {
    this.loadNotifications();
  }

  /**
   * Carga las notificaciones desde el servicio
   */
  async loadNotifications(): Promise<void> {
    try {
      this.loadingIndicator = true;
      const params = {
        page: this.page,
        limit: this.limit,
        ...this.filters
      };

      const response = await this.notificationService.getNotifications(params);

      if (response && response.data) {
        this.rows = this.handleResponse(response.data.rows);
        this.totalItems = response.data.count;
      } else {
        this.rows = [];
        this.totalItems = 0;
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      this.toastr.error('Error al cargar notificaciones', 'Error');
    } finally {
      this.loadingIndicator = false;
    }
  }
  /**
   * Aplica filtros a las notificaciones
   */
  async applyFilter(filter: any = {}): Promise<void> {
    this.filters = filter;
    this.page = 1;

    try {
      const response = await this.notificationService.getNotifications(filter);

      if (response && Array.isArray(response.rows)) {
        this.rows = this.handleResponse(response.rows);
        this.totalItems = response.count;
      } else if (response && response.data && Array.isArray(response.data.rows)) {
        this.rows = this.handleResponse(response.data.rows);
        this.totalItems = response.data.count;
      } else {
        console.error('Estructura inesperada de la respuesta:', response);
      }
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    }
    this.modalService.dismissAll();
  }

  /**
   * Maneja el cambio de página en la paginación
   */
  onPageChange(page: number): void {
    this.page = page;
    this.loadNotifications();
  }

  /**
   * Recibe eventos de filtro desde componentes hijos
   */
  onFilter(event: any) {
    this.applyFilter(event);
  }
  /**
   * Maneja la respuesta y transforma los datos para mostrar en la tabla
   */
  handleResponse(response: any[]): any[] {
    return response.map((row) => {
      // Formatear fecha
      const formattedDate = row.createdAt ?
        this.datePipe.transform(row.createdAt, 'yyyy-MM-dd HH:mm:ss') : '---';

      // Determinar clase para el tipo (info, success, warning, error)
      let typeClass = '';
      switch (row.type) {
        case 'info':
          typeClass = 'border-info text-info';
          break;
        case 'success':
          typeClass = 'border-success text-success';
          break;
        case 'warning':
          typeClass = 'border-warning text-warning';
          break;
        case 'error':
          typeClass = 'border-danger text-danger';
          break;
        default:
          typeClass = 'border-secondary text-secondary';
      }
      const typeMap: { [key: string]: string } = {
        info: 'Información',
        success: 'Éxito',
        warning: 'Advertencia',
        error: 'Error'
      };
      const typeText = typeMap[row.type?.toLowerCase?.()] || row.type || 'Otro';
      const typeHtml = `<span class="badge border ${typeClass}">${typeText}</span>`;

      // WhatsApp-style check marks
      let statusCheckHtml = '';
      const status = (row.status || '').toString().trim().toLowerCase();
      if (status === 'unread') {
        // Una palomita negra
        statusCheckHtml = `<span title="No leído"><i class="fas fa-check" style="color: #222; font-size: 1.3em;"></i></span>`;
      } else if (status === 'read') {
        statusCheckHtml = `<span title="Leído">
    <i class="fas fa-check check-green" style="margin-right: -4px;"></i>
    <i class="fas fa-check check-green"></i>
  </span>`;
      } else {
        statusCheckHtml = `<span>-</span>`;
      }

      // Determinar clase para la prioridad (low, medium, high)
      let priorityClass = '';
      let priorityText = '';
      switch (row.priority) {
        case 'low':
          priorityClass = 'border-success text-success';
          priorityText = 'Baja';
          break;
        case 'medium':
          priorityClass = 'border-warning text-warning';
          priorityText = 'Media';
          break;
        case 'high':
          priorityClass = 'border-danger text-danger';
          priorityText = 'Alta';
          break;
        default:
          priorityClass = 'border-secondary text-secondary';
          priorityText = row.priority || 'Normal';
      }
      const priorityHtml = `<span class="badge border ${priorityClass}">${priorityText}</span>`;

      // Generar enlace si existe
      let moduleHtml = row.module;
      if (row.link) {
        moduleHtml = `<a class="red-text link-action href-${row.link}">${row.module || '---'}</a>`;
      }

      // Formatear fecha para mostrar
      const dateHtml = `<span>${formattedDate}</span>`;

      // Agregar botones de acción
      const actionsHtml = `
        ${row.link ? `<a href="${row.link}" class="btn btn-sm btn-outline-info me-1" title="Ver detalles">
          <i class="fas fa-external-link-alt"></i>
        </a>` : ''}
        <button class="btn btn-sm btn-outline-primary" title="Marcar como leído">
          <i class="fas fa-check"></i>
        </button>`;

      return {
        ...row,
        moduleHtml,
        typeHtml,
        // statusHtml,
        dateHtml,
        priorityHtml,
        actionsHtml,
        // Añado también las versiones traducidas como propiedades
        // statusText,
        statusCheckHtml,
        priorityText
      };
    });
  }
  selectedNotification: any = null;

  /**
    * Ver detalle de la notificación (abriendo un modal)
    */
  viewDetailNotification(notification: any): void {
    this.selectedNotification = notification;
    this.modalService.open(this.notificationDetailModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notification: any): Promise<void> {
    try {
      await this.notificationService.updateNotification(notification.id, { status: 'read' });
      this.toastr.success('Notificación marcada como leída', 'Éxito');
      this.loadNotifications();
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      this.toastr.error('Error al marcar como leída', 'Error');
    }
  }

  /**
   * Marca una notificación como no leída
   */
  async markAsUnread(notification: any): Promise<void> {
    try {
      await this.notificationService.updateNotification(notification.id, { status: 'unread' });
      this.toastr.success('Notificación marcada como no leída', 'Éxito');
      this.loadNotifications();
    } catch (error) {
      console.error('Error al marcar como no leída:', error);
      this.toastr.error('Error al marcar como no leída', 'Error');
    }
  }
}
