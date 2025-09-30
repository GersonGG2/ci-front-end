import { Component, ViewChild } from '@angular/core';
import { GenericTableComponent } from "../../component/generic-table/generictable.component";
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../usuarios.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Alert } from 'src/app/helpers/alerts';

@Component({
  selector: 'app-usuarios',
  imports: [GenericTableComponent, ReactiveFormsModule, NgSelectModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  providers: [UsuariosService],
})
export class UsuariosComponent {
  @ViewChild('userModal') userModal: any;

  constructor(
    private usuariosService: UsuariosService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) { }

  rows: any[] = [];
  totalItems: number = 0;
  page: number = 1;
  limit: number = 10;
  filters: any = {};

  editingUser: any = null;
  lastAuthId = 12345678901234567890;

  columns = [
    { name: 'Nombre', prop: 'nombre', customView: 'nombreCompletoHtml', filter: false },
    { name: 'Email', prop: 'email', customView: 'emailHtml', filter: false },
    { name: 'Estado', prop: 'estado', customView: 'estadoHtml', filter: false, sortable: false },
    {
      name: 'Roles', prop: 'role', customView: 'rolesHtml', sortable: false, filter: true, type: 'select', options: [
        { value: 'Admin', text: 'Admin' },
        { value: 'Docente', text: 'Docente' },
        { value: 'Instructor', text: 'Instructor' },
        { value: 'Jefe de academia', text: 'Jefe de academia' }
      ]
    },
    {
      prop: 'action', name: 'Acción', width: 40, actions: [
        { name: 'Editar', icon: 'edit', action: (value, row) => this.onEdit(row) },
        { name: 'Eliminar', icon: 'trash', action: (value, row) => this.onDelete(row) }
      ]
    }
  ];

  form: FormGroup = this.fb.group({
    id: [null],
    auth0_id: [''],
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    password: [''],
    estado: [true],
    roles: [[]]
  });

  rolesCatalog = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Docente' },
    { id: 3, name: 'Instructor' },
    { id: 4, name: 'Jefe de academia' }
  ];

  ngOnInit() {
    this.getUsuarios();
  }

  async getUsuarios() {
    let result = await this.usuariosService.getAllUsuarios(this.page, this.limit, this.filters);
    this.rows = this.handleResponse(result.data.rows);
    this.totalItems = result.data.count;
  }

  async applyFilter(filter: any = {}): Promise<void> {
    const filters: any = filter;
    this.filters = filters;
    this.page = 1;

    try {
      const response = await this.usuariosService.getAllUsuarios(this.page, this.limit, filters);
      if (response && response.data && Array.isArray(response.data.rows)) {
        this.rows = this.handleResponse(response.data.rows);
        this.totalItems = response.data.count;
      } else {
        console.error('Estructura inesperada de la respuesta:', response);
      }
    } catch (error) {
      console.error('Error al aplicar filtros:', error);
    }
  }

  handleResponse(response): any[] {
    return response.map((item) => {
      const estadoHtml = item.estado
        ? `<span class="badge bg-success text-white"><i class="mdi mdi-check"></i> Activo</span>`
        : `<span class="badge bg-danger text-white"><i class="mdi mdi-close"></i> Inactivo</span>`;

      let rolesHtml = '';
      if (Array.isArray(item.roles)) {
        rolesHtml = item.roles.map(role => {
          let roleName = role.nombre;
          let roleClass = 'bg-secondary text-white';
          if (roleName === 'Jefe de academia') {
            roleName = 'Jefe';
            roleClass = 'bg-warning text-dark';
          } else if (roleName === 'Admin') {
            roleClass = 'bg-success text-white';
          } else if (roleName === 'Docente') {
            roleClass = 'bg-secondary text-white';
          } else if (roleName === 'Instructor') {
            roleClass = 'bg-info text-white';
          }
          return `<span class="badge ${roleClass}">${roleName}</span>`;
        }).join(' ');
      }

      const nombreCompletoHtml = `${item.nombre} ${item.apellidos}`;
      const emailHtml = `${item.email}`;

      return {
        ...item,
        nombreCompletoHtml,
        emailHtml,
        estadoHtml,
        rolesHtml,
      };
    });
  }

    openUserModal(user?: any) {
    if (user) {
      // Editar
      this.form.reset();
      this.form.patchValue({
        id: user.id,
        auth0_id: user.auth0_id,
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        estado: user.estado,
        roles: user.roles.map((r: any) => r.id),
        password: ''
      });
      this.editingUser = user;
      this.modalService.open(this.userModal, { centered: true });
    } else {
      // Agregar
      this.form.reset();
      const randomId = `auth0|${Date.now()}${Math.floor(Math.random() * 100000)}`;
      this.form.patchValue({
        auth0_id: randomId,
        estado: true,
        roles: [],
        password: ''
      });
      this.editingUser = null; // <-- Mueve esto ANTES de abrir el modal
      this.modalService.open(this.userModal, { centered: true });
    }
  }

  closeUserModal() {
    this.modalService.dismissAll();
    this.editingUser = null;
  }

  async onSubmit() {
    if (this.form.invalid) return;
    const { id, email, nombre, apellidos, roles, estado, password, auth0_id } = this.form.value;
    try {
      if (id) {
        // Editar usuario
        await this.usuariosService.updateUsuario(id, { auth0_id, email, nombre, apellidos, estado });
        await this.usuariosService.replaceRoles(id, { roleIds: roles });
        this.toastr.success('Usuario actualizado');
      } else {
        // Registrar usuario (nuevo endpoint y payload)
        await this.usuariosService.registerUsuario({
          email,
          nombre,
          apellidos,
          password,
          roles
        });
        this.lastAuthId += 1;
        this.toastr.success('Usuario agregado');
      }
      this.closeUserModal();
      this.getUsuarios();
    } catch (err) {
      this.toastr.error('Error al guardar usuario');
    }
  }

  async onDelete(row: any) {
    const confirmed = await Alert.question(
      'Eliminar usuario',
      '¿Seguro que deseas eliminar este usuario?'
    );
    if (!confirmed) return;

    this.usuariosService.deleteUsuario(row.id)
      .then(() => {
        this.toastr.success('Usuario eliminado');
        this.getUsuarios();
      })
      .catch((err) => {
        let msg = 'Error al eliminar usuario';
        if (err?.error?.message) {
          msg = err.error.message;
        } else if (err?.message) {
          msg = err.message;
        }
        this.toastr.error(msg, 'Error');
      });
  }


  onEdit(user: any) {
    this.form.reset();
    this.form.patchValue({
      id: user.id,
      auth0_id: user.auth0_id,
      email: user.email,
      nombre: user.nombre,
      apellidos: user.apellidos,
      estado: user.estado,
      roles: user.roles.map((r: any) => r.id)
    });
    this.editingUser = user;
    this.modalService.open(this.userModal, { centered: true });
  }
}
