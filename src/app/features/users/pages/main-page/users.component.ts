import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GenericTableComponent } from "../../../component/generic-table/generictable.component";
import { AbstractControl, FormGroup, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../services/usersService.service';
import { ModulesService } from 'src/app/features/modules/services/modulesService.service';
import { PageService } from 'src/app/features/pages/services/pageService.service';
import { EmployeeService } from 'src/app/features/employees/services/employeeService.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { GenericSelectorComponent } from 'src/app/features/component/generic-selector/genericselector.component';
import { MenusService } from 'src/app/features/menus/services/menusService.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { BreadcrumbService } from 'src/app/shared/services/breadcrumb.service';
import { Alert } from 'src/app/helpers/alerts';
import { ExcelHelper } from 'src/app/helpers/excel-helper';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [GenericTableComponent, ReactiveFormsModule, CommonModule, NgSelectComponent],
  providers: [UserService, ModulesService, MenusService, ExcelHelper]
})
export class UsersComponent implements OnInit {

  breadcrumbService = inject(BreadcrumbService)
  // ==================================================
  // ViewChild - Modales
  // ==================================================
  @ViewChild('userModal') userModal: any;

  rows: any[] = [];
  totalItems: number = 0;
  loadingIndicator: boolean = true;
  page: number = 1;
  limit: number = 10;
  filters: any = {};

  // Formulario de página
  userForm: FormGroup;
  submitted = false;
  isEditMode = false;
  isCopyMode = false;

  branchList: any[] = [];
  showSignature = false

  selectedMenu = { menuName: '', menuId: 0 };
  selectedEmployee = { fullName: '', employeeId: 0 };


  editingUserId: number | null = null;

  // Definición de columnas para la tabla paginas
  columns = [
    {
      name: 'Correo Electrónico',
      prop: 'emailAddress',
      filter: true,
    },
    { name: 'Nombre de Usuario', prop: 'fullName', filter: true },
    { name: 'Habilitado', prop: 'enabledFlag', width: 40, view: (value, row) => this.getBooleanSymbol(value === 'Y') },
    { name: 'Admin', prop: 'adminFlag', width: 40, view: (value, row) => this.getBooleanSymbol(value === 'Y') },
    {
      prop: 'action',
      name: 'Acción',
      width: 40,
      actions: [
        { name: 'Editar', icon: 'edit', action: (value, row) => this.openModal(this.userModal, row) },
        { name: 'Copiar', icon: 'copy', action: (value, row) => this.openCopyModal(this.userModal, row) },
        { name: 'Eliminar', icon: 'trash', action: (value, row) => this.deleteUser(row) }
      ]
    }
  ];

  menusList: any[] = [];
  totalItemsMenu: number = 0;
  menuPage: number = 1

  columns_menu = [
    { name: 'Nombre', prop: 'menuName', filter: true },
    { name: 'Descripción', prop: 'description', filter: true }
  ];

  employeeList: any[] = [];
  totalItemsEmployee: number = 0;
  employeePage: number = 1;
  columns_employee = [
    { name: 'Nombre', prop: 'fullName', filter: true },
    { name: 'Código', prop: 'employeeInt', filter: true }
  ];



  constructor(
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private userService: UserService,
    private employeeService: EmployeeService,
    private menuService: MenusService,
    private toastr: ToastrService,
    private excelHelper: ExcelHelper) {
    this.userForm = this.fb.group({
      CorreoElectronico: ['', Validators.required],
      Contraseña: [''],
      Nombre: ['', Validators.required],               // firstName
      ApellidoPaterno: [''],                             // middleName
      ApellidoMaterno: [''],                             // lastName
      Telefono: ['', [Validators.pattern('^[0-9]*$'), Validators.maxLength(10)]],
      MenuName: ['', [Validators.required, this.validateMenuField.bind(this)]],
      Menu: [null],            // para almacenar menuId
      FechaInactiva: [''],
      Habilitado: [false],
      Admin: [false],
      EmpleadoName: ['', [Validators.required, this.validateEmpeladoField.bind(this)]],
      Empleado: [null],        // para almacenar employeeId
      Sucursal: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadBranches();
    this.breadcrumbService.setFormSubscribe(this.userForm);
  }
  async loadUsers() {
    try {
      const response = await this.userService.getUsersListFiltered(this.page, this.limit, this.filters);
      if (response && Array.isArray(response.rows)) {
        this.rows = response.rows;
        this.totalItems = response.count;
      } else if (response && response.data && Array.isArray(response.data.rows)) {
        this.rows = response.data.rows;
        this.totalItems = response.data.count;
      } else {
        console.error('La estructura de la respuesta es inesperada:', response);
      }
      this.loadingIndicator = false;
    } catch (error) {
      console.error('Error cargando activos:', error);
    }
  }
  async applyFilter(filter: any = {}): Promise<void> {
    const filters: any = filter;
    this.page = 1;

    if (filter.searchValue) {
      filters.emailAddress = filter.searchValue;
      filters.fullName = filter.searchValue;
    }

    this.filters = filters;

    try {
      const response = await this.userService.getUsersListFiltered(this.page, this.limit, filters);
      if (response && Array.isArray(response.rows)) {
        this.rows = response.rows;
        this.totalItems = response.count;
      } else if (response && response.data && Array.isArray(response.data.rows)) {
        this.rows = response.data.rows;
        this.totalItems = response.data.count;
      } else {
        console.error('La estructura de la respuesta filtrada es inesperada:', response);
      }
    } catch (error) {
      console.error('Error al cargar activos filtrados:', error);
    }
    this.modalService.dismissAll();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadUsers();
  }

  onFilter(event: any) {
    this.applyFilter(event);
  }
  // ==================================================
  // BRANCHES O SUCURSALES
  // ==================================================
  async loadBranches(): Promise<void> {
    try {
      const response = await this.userService.getPreFormData(0);
      if (response && response.data && Array.isArray(response.data.branchList)) {
        this.branchList = response.data.branchList;
      } else {
        console.error('La estructura de la respuesta de sucursales es inesperada:', response);
      }
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  }
  // ==================================================
  // AGREGAR,EDITAR,COPIAR,ELIMINAR
  // ==================================================

  user: any = {};

  async openModal(modalTemplate: TemplateRef<any>, row: any = null): Promise<void> {
    await this.loadBranches();
    if (row) {
      this.isEditMode = true;
      this.editingUserId = row.userId;
      // Obtener toda la información del usuario usando getPreFormData por id
      const preFormData = await this.userService.getPreFormData(row.userId);
      this.user = preFormData;
      if (preFormData && preFormData.data && preFormData.data.user) {
        const user = preFormData.data.user;
        this.selectedMenu = {
          menuName: user.menu ? user.menu.menuName : '',
          menuId: user.rmaMenuId
        };
        this.selectedEmployee = {
          fullName: user.employee ? user.employee.fullName : '',
          employeeId: user.employee ? user.employee.employeeId : 0
        };
        this.userForm.patchValue({
          CorreoElectronico: user.emailAddress,
          // Puedes dejar la contraseña en blanco o asignarla según tu lógica
          Contraseña: '',
          Nombre: user.firstName,
          ApellidoPaterno: user.middleName || '',
          ApellidoMaterno: user.lastName || '',
          Telefono: user.phoneNumber,
          Habilitado: user.enabledFlag === 'Y',
          Admin: user.adminFlag === 'Y',
          FechaInactiva: user.inactiveDate || null,
          Sucursal: user.branchId,
          Menu: user.rmaMenuId,
          MenuName: user.menu ? user.menu.menuName : '',
          Empleado: user.employee ? user.employee.employeeId : null,
          EmpleadoName: user.employee ? user.employee.fullName : ''
        });
      } else {
        console.error('No se encontró la información completa del usuario');
      }
    } else {
      // Modo agregar
      this.isEditMode = false;
      this.editingUserId = null;
      this.userForm.reset();
      this.userForm.patchValue({ Habilitado: true });
    }
    this.modalService.open(modalTemplate, { centered: true });
    // Marcar todos los campos como tocados para mostrar los mensajes de error
    Object.keys(this.userForm.controls).forEach(field => {
      const control = this.userForm.get(field);
      // Solo marcar como tocados los campos que tienen validadores
      if (control?.validator) {
        control.markAsTouched();
      }
    });
    this.breadcrumbService.showModal.set(false);
  }

  async openCopyModal(modalTemplate: TemplateRef<any>, row: any): Promise<void> {
    this.isCopyMode = !!row;
    await this.loadBranches();
    // Obtener la información completa del usuario a copiar
    const preFormData = await this.userService.getPreFormData(row.userId);
    if (preFormData && preFormData.data && preFormData.data.user) {
      const user = preFormData.data.user;
      // Pre-cargamos los datos en el formulario, pero eliminamos el identificador y dejamos el email vacío (o lo puedes ajustar)
      this.userForm.patchValue({
        CorreoElectronico: '',  // Email en blanco para nuevo usuario
        Contraseña: '',
        Nombre: user.firstName,
        ApellidoPaterno: user.middleName || '',
        ApellidoMaterno: user.lastName || '',
        Telefono: user.phoneNumber,
        Habilitado: user.enabledFlag === 'Y',
        Admin: user.adminFlag === 'Y',
        FechaInactiva: user.inactiveDate || null,
        Sucursal: user.branchId,
        Menu: user.rmaMenuId,
        MenuName: user.menu ? user.menu.menuName : '',
        Empleado: user.employee ? user.employee.employeeId : null,
        EmpleadoName: user.employee ? user.employee.fullName : ''
      });
      // Establece modo copiar: para copiar se trata como un nuevo registro (modo agregar)
      this.isEditMode = false;
      this.editingUserId = null;
    } else {
      console.error('No se encontró la información completa del usuario para copiar');
      this.userForm.reset();
    }
    this.modalService.open(modalTemplate, { centered: true });
    // Marcar todos los campos como tocados para mostrar los mensajes de error
    Object.keys(this.userForm.controls).forEach(field => {
      const control = this.userForm.get(field);
      // Solo marcar como tocados los campos que tienen validadores
      if (control?.validator) {
        control.markAsTouched();
      }
    });
  }

  // Método para enviar (crear o actualizar) el usuario
  // Dentro de la clase UsersComponent, agrega o modifica onSubmit de la siguiente forma:
  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.userForm.invalid) {
      return;
    }
    const formValues = this.userForm.value;
    const payload: any = {
      emailAddress: formValues.CorreoElectronico,
      encryptedUserPassword: formValues.Contraseña,
      fullName: `${formValues.Nombre} ${formValues.ApellidoPaterno || ''} ${formValues.ApellidoMaterno || ''}`.trim(),
      firstName: formValues.Nombre,
      middleName: formValues.ApellidoPaterno || '',
      lastName: formValues.ApellidoMaterno || '',
      phoneNumber: formValues.Telefono,
      menu: { id: formValues.Menu },         // menu id se envía aquí
      employee: { id: formValues.Empleado }, // employee id se envía aquí
      enabledFlag: formValues.Habilitado ? 'Y' : 'N',
      adminFlag: formValues.Admin ? 'Y' : 'N',
      inactiveDate: formValues.FechaInactiva || null,
      contextValue: 'HR_USER',
      customField1: '',
      customField2: '',
      customField3: '',
      customField4: '',
      customField5: '',
      branch: { store_value: formValues.Sucursal },     // se envía el branchId seleccionado
      customerId: null,
      customerIds: '',
      isRegisteredUser: true
    };

    try {
      if (this.isEditMode) {
        payload.userId = this.editingUserId;
        const response = await this.userService.updateUser(payload);
        if (response) {
          this.toastr.success('Usuario actualizado exitosamente.', 'Éxito');
          this.modalService.dismissAll();
          this.loadUsers();
        }
      } else {
        const response = await this.userService.createUser(payload);
        const data = {
          email: formValues.CorreoElectronico,
          name: `${formValues.Nombre} ${formValues.ApellidoPaterno || ''} ${formValues.ApellidoMaterno || ''}`.trim(),
          nickName: formValues.Nombre
        };
        await this.userService.createAuth0User(data);
        if (response) {
          this.toastr.success('Usuario creado exitosamente.', 'Éxito');
          this.modalService.dismissAll();
          this.loadUsers();
        }
      }
    } catch (error) {
      console.error('Error al crear/actualizar el usuario:', error);
      this.toastr.error('Error al crear/actualizar el usuario, intente nuevamente.', 'Error');
    }
    finally { this.isCopyMode = false };
  }

  deleteUser(row: any): void {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.userService.deleteUser(row.userId).subscribe({
        next: (response: any) => {
          this.loadUsers();
          this.toastr.success('Usuario eliminado exitosamente.', 'Éxito');
        },
        error: (error: any) => {
          console.error('Error al eliminar el usuario:', error);
          const errorMessage = error?.error?.message || 'Error al eliminar el usuario, intente nuevamente.';
          this.toastr.error(errorMessage, 'Error');
        }
      });
    }
  }


  // Método para cerrar el modal
  async closeBtnClick(modalReference?: any, isSaving: boolean = false): Promise<void> {
    const hasChanges = Object.values(this.userForm.controls).some(control => control.dirty);

    if (hasChanges && !isSaving) {
      const confirmed = await Alert.question(
        'Confirmar',
        '¿Estás seguro que deseas salir? Se perderán los cambios no guardados.',
        'AcceptCancel'
      );

      if (!confirmed) {
        return;
      }
    }

    this.showSignature = false;
    if (modalReference) {
      modalReference.dismiss();
    } else {
      this.modalService.dismissAll();
    }
  }

  async exportDataToExcel(): Promise<void> {
    //const filters = this.createFilterData();
    const filters: any = {};
    filters.emailAddress = this.filters.search;
    filters.fullName = this.filters.search;

    const response = await this.userService.getUsersListFiltered(1, this.totalItems, this.filters);
    //const response = await this.assetsListService.getAssetListFiltered(1, this.totalItems, filters);
    this.excelHelper.exportDataToExcel(response.count || response.data.count, response.rows || response.data.rows, this.columns, "Usuarios")
  }

  onExport(): void {
    this.userService.exportUsersExcel()
      .then((blob) => {
        const url = window.URL.createObjectURL(blob); // Crea una URL para el archivo
        const a = document.createElement('a'); // Crea un enlace para descargar
        a.href = url;
        a.download = 'simple_users.xlsx'; // Nombre del archivo
        a.click(); // Simula el clic para descargar
        window.URL.revokeObjectURL(url); // Limpia la URL creada
      })
      .catch((error) => {
        console.error('Error al exportar el archivo Excel:', error);
        this.toastr.error('Error al exportar el archivo Excel, intente nuevamente.', 'Error');
      });
  }

  // Utiles
  getBooleanSymbol(value: boolean): string {
    return value ? '✔️' : '❌';
  }


  // ==================================================
  // SELECCIONAR MODULOS
  // ==================================================
  async loadMenus(filter: any = {}): Promise<void> {
    try {
      // Se asume que existe en ModulesService un método getMenuFiltered o similar
      let response = await this.menuService.getMenusList(filter);
      if (response && response.data && Array.isArray(response.data.rows)) {
        this.menusList = response.data.rows;
        // Ajustamos la propiedad id para utilizarla en el selector
        this.menusList.forEach((element: any) => {
          element.id = element.menuId;
        });
        this.totalItemsMenu = response.data.count;
      } else {
        console.error('La estructura de la respuesta de menús es inesperada:', response);
      }
    } catch (error) {
      console.error('Error al cargar menús:', error);
    }
  }

  // Método para abrir el modal de selección de menú
  async openSelectMenuModal(): Promise<void> {

    const search = this.userForm.get("MenuName")?.value || '';
    const filter = { searchValue: this.user?.data?.user?.menu?.menuName == search ? '' : search };
    await this.loadMenus(filter);

    // Se abre el modal utilizando un componente selector genérico (asegúrate de tener GenericSelectorComponent)
    const modalRef = this.modalService.open(GenericSelectorComponent, { centered: true, backdrop: 'static', size: 'lg' });

    modalRef.componentInstance.rows = this.menusList;
    modalRef.componentInstance.columns = this.columns_menu;
    modalRef.componentInstance.total = this.totalItemsMenu;
    modalRef.componentInstance.page = this.menuPage;
    modalRef.componentInstance.selector = 'single';
    modalRef.componentInstance.title = 'Elija Menú';
    modalRef.componentInstance.showSearchIcon = true;
    modalRef.componentInstance.btnRefresh = true;
    modalRef.componentInstance.initSearch = filter.searchValue;

    modalRef.componentInstance.filter.subscribe(async (filter: any) => {
      // Si el valor de búsqueda está vacío o es nulo/indefinido, tratarlo como un refresh.
      await this.loadMenus(filter);
      
      modalRef.componentInstance.rows = this.menusList;
      modalRef.componentInstance.total = this.totalItemsMenu;
    });

    modalRef.componentInstance.selected.subscribe((selected: any) => {
      this.onMenuSelected(selected);
    });
  }

  // Método cuando se ha seleccionado un menú
  onMenuSelected(menu: any): void {
    if (menu && menu.length > 0) {
      const selectedMenu = menu[0];

      this.selectedMenu = {
        menuName: selectedMenu.menuName,
        menuId: selectedMenu.menuId
      };

      // Actualiza el campo MenuName y el campo Menu en el formulario de usuario
      this.userForm.patchValue({
        MenuName: selectedMenu['menuName'] || '',
        Menu: selectedMenu['menuId'] || 0
      });
    }
  }

  // ==================================================
  // SELECCIONAR EMPLEADO
  // ==================================================
  async loadEmployees(filter: any = {}): Promise<void> {
    try {
      // Se asume que EmployeeService tiene un método getEmployeeListFiltered similar a otros métodos de listado
      let response = await this.employeeService.getEmployeeList(filter);
      if (response && response.data && Array.isArray(response.data.rows)) {
        this.employeeList = response.data.rows;
        this.employeeList.forEach((element: any) => {
          element.id = element.employeeId;
        });
        this.totalItemsEmployee = response.data.count;
      } else {
        console.error('La estructura de la respuesta de empleados es inesperada:', response);
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  }

  async openSelectEmployeesModal(): Promise<void> {

    const search = this.userForm.get("EmpleadoName")?.value || '';
    const filter = { searchValue: this.user?.data?.user?.employee?.fullName == search ? '' : search };
    await this.loadEmployees(filter);

    const modalRef = this.modalService.open(GenericSelectorComponent, { centered: true, backdrop: 'static', size: 'lg' });

    modalRef.componentInstance.rows = this.employeeList;
    modalRef.componentInstance.columns = this.columns_employee;
    modalRef.componentInstance.total = this.totalItemsEmployee;
    modalRef.componentInstance.page = this.employeePage;
    modalRef.componentInstance.selector = 'single';
    modalRef.componentInstance.title = 'Elija Empleado';
    modalRef.componentInstance.showSearchIcon = true;
    modalRef.componentInstance.btnRefresh = true;
    modalRef.componentInstance.initSearch = filter.searchValue;

    modalRef.componentInstance.filter.subscribe(async (filter: any) => {
      await this.loadEmployees(filter);
      modalRef.componentInstance.rows = this.employeeList;
      modalRef.componentInstance.total = this.totalItemsEmployee;
    });

    modalRef.componentInstance.selected.subscribe((selected: any) => {
      this.onEmployeeSelected(selected);
    });
  }

  onEmployeeSelected(employee: any): void {

    if (employee && employee.length > 0) {
      const selected = employee[0];

      this.selectedEmployee = {
        fullName: selected.fullName,
        employeeId: selected.employeeId
      };

      // Actualiza el campo EmpleadoName y Empleado en el formulario de usuario
      this.userForm.patchValue({
        EmpleadoName: selected['fullName'] || '',
        Empleado: selected['employeeId'] || 0
      });
    }
  }

  // requeridos
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field?.invalid && field?.touched;
  }

  validateMenuField(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== this.selectedMenu?.menuName ||
      (control.value && !this.selectedMenu?.menuName)) {
      return { invalidMenu: true };
    }
    return null;
  }

  validateEmpeladoField(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== this.selectedEmployee?.fullName ||
      (control.value && !this.selectedEmployee?.fullName)) {
      return { invalidEmpleado: true };
    }
    return null;
  }

  clearField(fieldProp: string): void {
    this.userForm.patchValue({ [fieldProp]: '' });
  }

  getClearField(prop): any {
    return this.userForm.value[prop];
  }

  onTelefonoInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    this.userForm.get('Telefono')?.setValue(input.value, { emitEvent: false });
  }

}
