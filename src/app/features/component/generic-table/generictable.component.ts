import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, Renderer2, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbAlertModule, NgbDropdown, NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, NgxDatatableModule, SelectionType } from '@swimlane/ngx-datatable';
import { FeatherModule } from 'angular-feather';
import { debounceTime, distinctUntilChanged, find, Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  templateUrl: './generictable.component.html',
  styleUrls: ['./generictable.component.scss'],
  imports: [
    NgxDatatableModule,
    NgbPaginationModule,
    CommonModule,
    NgbAccordionModule,
    NgbAlertModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    FeatherModule,

    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
  ]
})
export class GenericTableComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChildren(NgbDropdown) dropdowns: QueryList<NgbDropdown>;
  @ViewChild('inputSearch') inputSearch: ElementRef;
  private scrollListener: () => void;

  //obtenemos el elemento del DOM de la tabla

  private searchSubject: Subject<string> = new Subject();
  private filterSubject: Subject<any> = new Subject();

  private lastSearchLength: number = 0;
  private lastFilterLength: number = 0;

  @Input() rows: any[] = [];
  crows: any[] = [];
  @Input() columns: {
    prop: string;
    props?: any;
    name: string;
    minWidth?: number;
    maxWidth?: number;
    width?: number;
    rwidth?: number;
    lineal?: boolean;
    sortable?: boolean;
    filter?: boolean;
    view?: any;
    actions?: any;
    options?: any;
    type?: string;
    tabs?: boolean;
    component?: boolean;
    index?: number;
    col?: boolean;
    default?: any;
    change?: any;
    checkbox?: boolean;
    validate?: any
    frozenLeft?: boolean;
    frozenRight?: boolean;
    format?: any;
    flexGrow?: any;
    autoExpand?: any;
    expand?: any;
    isAdd?: boolean,
    action?: any,
    error?: any,
  }[] = [];

  @Input() headerHeight: number = 40;
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() loading: boolean = false;
  @Input() placeholder: string = 'Buscar...';
  @Input() isAdd: boolean = false;
  @Input() isExport: boolean = false;
  @Input() selector: 'single' | 'multiple' | 'checkbox' | 'button' = null;
  @Input() parameters: boolean = true;
  @Input() local: boolean = false;
  @Input() title: string = 'Parámetros';
  @Input() isMenu: boolean = false;
  @Input() options: any[] = [];
  @Input() buttons: any[] = [];
  @Input() isRender: boolean = true;
  @Input() customParams: boolean = false;
  @Input() showFilter: boolean = true;
  @Input() isDoubleClick: boolean = false;
  @Input() initSearch: string = '';
  @Input() btnRefresh: boolean = false;
  @Input() clearIconClass: string | undefined;
  @Input() showSearchIcon: boolean = false;
  @Input() showRefreshIcon: boolean = false;
  @Input() filteredTotalCount: number = 0;

  @Output() filter: EventEmitter<any> = new EventEmitter<any>();
  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() export: EventEmitter<any> = new EventEmitter<any>();
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() dbclick: EventEmitter<any> = new EventEmitter<any>();
  @Output() filteredTotal: EventEmitter<number> = new EventEmitter<number>();

  limit: number = 10;
  offset: number = 0;
  sort: string = '';
  order: string = '';
  search: string = '';
  sizes: number[] = [10, 15, 20, 50, 100];
  fields: any[] = [];
  filterForm: FormGroup;
  selecteds = [];
  selectionType: SelectionType = null;
  advancedSearch: any = {};
  _columns: any[] = [];
  private injectorCache = new Map<any, Injector>();

  tableId = 'table_' + new Date().getTime();

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer, private injector: Injector,
    private cdr: ChangeDetectorRef, private router: Router,
  ) {
    this.searchSubject
      .pipe(
        debounceTime(300), // Retraso para evitar solicitudes excesivas
        distinctUntilChanged() // Evita búsquedas si el valor no ha cambiado
      )
      .subscribe((searchTerm) => {
        this.setSearch(searchTerm);
      });

    this.filterSubject
      .pipe(
        debounceTime(300), // Retraso para evitar solicitudes excesivas
        distinctUntilChanged() // Evita búsquedas si el valor no ha cambiado
      )
      .subscribe(() => {
        if (this.filterForm.valid) {
          this.onSearchSubmit();
        }
      });
  }

  refresh = false;

  ngOnChanges(changes: SimpleChanges): void {

    this.injectorCache.clear()

    if (changes['initSearch'] && changes['initSearch'].currentValue) {
      this.search = changes['initSearch'].currentValue;
    }

    if (changes['rows'] || changes['columns']) {

      this.rows = [...this.rows.map((item, index) => ({
        ...item,
        tableId: 1 + index
      }))];

      this.refresh = true;

      if (this.fields.length === 0) {
        this.createFilterForm();
      }

      if (this.rows.length > 0) {

        let key = this.columns.find((column) => column.checkbox || column.isAdd)
        if (this.selecteds.length > 0 && key) {
          this.rows.forEach((row) => {
            const selectedRow = this.selecteds.find((selected) => selected[key.prop] === row[key.prop]);
            if (selectedRow) {
              row.selected = true;
            }
          });
        }

        this.refreshTable();

        if (this.local) {
          this.localRows();
        } else {
          this.calculateWidthMin(this.rows);
        }

        this.refresh = false;

      }

    }

    /*if (changes['incomingSelection']) {
      const cloneIncoming = JSON.stringify(changes['incomingSelection'].currentValue)
      const cloneLocal = JSON.stringify(this.selecteds)
      if (cloneLocal !== cloneIncoming) {
        this.selecteds = JSON.parse(JSON.stringify(changes['incomingSelection'].currentValue))

        let key = this.columns.find((column) => column.checkbox || column.isAdd)
        if (this.selecteds.length > 0 && key) {
          this.rows.forEach((row) => {
            const selectedRow = this.selecteds.find((selected) => selected[key.prop] === row[key.prop]);
            if (selectedRow) {
              row.selected = true;
            }
          });
        }
        this.localRows();
        this.selected.emit(this.selecteds);
      }
    }*/

    if (changes['selector']) {
      if (this.selector === 'single') {
        this.selectionType = SelectionType.single;
      } else if (this.selector === 'multiple') {
        this.selectionType = SelectionType.multiClick;
      } else {
        this.selectionType = SelectionType.checkbox;
      }
    }


  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // Agrega un listener al evento scroll
    this.scrollListener = () => {
      if (this.dropdowns) {
        this.dropdowns.forEach((dropdown) => {
          if (dropdown.isOpen()) {
            dropdown.close(); // Cierra cada dropdown abierto
          }
        });
      }
    };

    // Escucha el evento scroll en la ventana
    window.addEventListener('scroll', this.scrollListener, true); // Usa `true` para capturar eventos en el bubbling phase

    setTimeout(() => this.calculateColumnsWidth(), 0);

  }

  ngOnDestroy(): void {
    // Elimina el listener al destruir el componente
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, true);
    }
  }

  createFilterForm() {

    this.columns.forEach((column) => {
      column.name = column.name.toUpperCase();
      column.rwidth = column.rwidth == undefined ? column.width : column.rwidth;
      column.col = column.col == undefined ? true : column.col;
    });
    this._columns = this.columns.filter((column) => column.col);

    this.fields = [];
    const formControls = {};
    let fields = this.columns.filter((column) => column.filter);

    fields.forEach((field) => {
      if (!field.props) {
        this.fields.push(field);
        // Inicializar con un valor vacío
        formControls[field.prop] = [field.default || null];
      } else {
        field.props.forEach((prop) => {
          prop.filter = prop.filter == undefined ? true : prop.filter;
          if (prop.filter) {
            this.fields.push({ prop: prop.prop, name: prop.name, type: field.type || prop.type, index: prop.index, options: field.options });
            formControls[prop.prop] = [prop.default || null]; // Inicializar con un valor vacío
          }
        });
      }
    });

    this.fields = this.fields.sort((a, b) => { return a.index - b.index; });
    this.filterForm = this.fb.group(formControls);

    //this.filterForm.reset();
  }

  setLimit(event: any): void {
    this.limit = event.target.value;
    if (this.local) this.localRows();
    else this.filter.emit(this.getFilter());
  }

  setPage(event: any): void {
    this.offset = event;
    if (this.local) this.localRows();
    else this.filter.emit(this.getFilter());
  }

  setSort(event: any): void {
    this.sort = event.sorts[0].prop;
    this.order = event.sorts[0].dir;
    if (this.local) this.localRows();
    else this.filter.emit(this.getFilter());
  }

  setSearch(value: string): void {
    this.lastSearchLength = 0;
    this.search = value.trim();
    if (this.local) this.localRows();
    else this.filter.emit(this.getFilter());
  }

  getFilter() {

    let count = 0;

    this.advancedSearch = { ...this.filterForm.value };
    Object.keys(this.advancedSearch).forEach((key) => {
      if (this.advancedSearch[key] === '') {
        delete this.advancedSearch[key];
      }

      if (key.includes('.') && key.split('.').length > 1) {
        const newKey = key.split('.')[1];
        this.advancedSearch[newKey] = this.advancedSearch[key]?.trim();
        delete this.advancedSearch[key];
      }

    });

    if (this.sort.includes('.') && this.sort.split('.').length > 1 && this.customParams) {
      this.sort = this.sort.split('.')[1];
    }

    return {
      ...this.advancedSearch,
      limit: this.limit,
      page: this.offset == 0 ? 1 : this.offset,
      sort: this.sort,
      order: this.order,
      searchValue: this.search
    };
  }

  refreshFilter() {
    if (this.local) this.localRows();
    else this.filter.emit(this.getFilter());
  }

  getShowings() {
    if (this.total === 0) {
      return 'sin datos';
    }

    let offset = this.offset > 0 ? this.offset - 1 : 0;

    let result = offset * this.limit + 1;
    let end = offset * this.limit + this.limit;
    if (end > this.total) {
      end = this.total;
    }

    return `${result} - ${end} de ${this.total}`;
  }

  onSearchKeyUp(event: any) {
    this.executeSearchSubject(event.key, event.target.value);
  }

  onSearchButtonClick() {
    const searchValue = this.inputSearch.nativeElement.value;
    this.setSearch(searchValue);
  }

  cleanSearchSubject() {
    this.search = '';
    this.inputSearch.nativeElement.value = '';
    this.executeSearchSubject('clean', '');
  }

  executeSearchSubject(key: string, value: string) {
    if (key === 'Enter') {
      this.setSearch(value);
      return;
    }
    const currentValue = value;
    if (Math.abs(currentValue.length - this.lastSearchLength) >= 1 || currentValue.length === 0) {
      this.searchSubject.next(currentValue);
      this.lastSearchLength = currentValue.length;
    }
  }

  executeFilterSubject(key: string, value: string) {
    if (key === 'Enter') {
      this.onSearchSubmit(value);
      return;
    }
    const currentValue = value;
    if (Math.abs(currentValue.length - this.lastFilterLength) >= 1 || currentValue.length === 0) {
      this.filterSubject.next(currentValue);
      this.lastFilterLength = currentValue.length;
    }
  }
  onSearchKeyUpFilter(event: any) {
    this.inputSearch.nativeElement.value = '';
    this.search = '';
    this.executeFilterSubject(event.key, event.target.value);
  }

  onSearchSubmit(event: any = null) {
    if (event && event.preventDefault) event.preventDefault();
    if (this.filterForm.valid) {
      this.lastSearchLength = 0
      if (Object.values(this.filterForm.value).every(value => !value)) {
        this.search = '';
        this.inputSearch.nativeElement.value = '';
      }
      this.filter.emit(this.getFilter());
    }
  }

  onAdd() {
    this.add.emit();
  }

  onRowDoubleClick(column, row): void {

    if (this.selectionType === SelectionType.checkbox)
      return;

    if (this.isDoubleClick) {
      this.dbclick.emit([row]);
      return;
    }

    let col = this.columns.find((col) => col.prop === 'action');
    if (!col) { return; }

    let action = col?.actions.find((action) => action.open);

    // Solo valida si existe la función validate
    if (action && typeof col.validate === 'function' && !col.validate(action, row)) {
      action = null;
    }

    if (!action) {
      action = col?.actions.find((action) => action.name === 'Editar');
      if (!action) return;
    }

    // Solo valida si existe la función validate
    if (typeof col.validate === 'function' && !col.validate(action, row)) {
      return;
    }

    action.action(null, row);
  }

  onExport() {
    this.export.emit();
  }

  calculateWidthMin(rows, retryCount = 0) {

    if (this.columns.length === 0) {
      return;
    }

    // Limitar el número de intentos para evitar recursión infinita
    if (retryCount > 5) {
      return;
    }

    // Obtén el ancho total de la tabla
    const tableWidth = document.getElementById(this.tableId)?.offsetWidth || 0;

    if (tableWidth === 0) {
      // Esperar un breve momento antes de intentar nuevamente
      setTimeout(() => {
        this.calculateWidthMin(rows, retryCount + 1);
      }, 100);
      return;
    }


    // Calcula el ancho total ocupado por las columnas de tipo 'action'
    const actionColumns = this.columns.filter((column) => column.prop === 'action' || column.prop === 'checkbox');
    const actionWidth = actionColumns.length * 80; // Cada columna de tipo 'action' ocupa 70px

    // Calcula el ancho disponible para las demás columnas
    const availableWidth = tableWidth - actionWidth;

    // Si hay pocas columnas, distribuye el ancho proporcionalmente
    if (this.columns.length < 8 && this.isRender) {
      const columnWidth = Math.floor(availableWidth / (this.columns.length - actionColumns.length)); // Ancho proporcional por columna

      this.columns.forEach((column) => {

        if (column.prop === 'checkbox') {
          column.name = 'Selección';
          column.minWidth = 80;
          column.maxWidth = 80;
          column.sortable = false;
        } else if (column.prop === 'action') {
          column.minWidth = 80;
          column.maxWidth = 80;
          column.sortable = false;
        } else {
          column.minWidth = columnWidth;
          column.maxWidth = columnWidth;
        }
      });

      return;
    }

    this.columns.forEach((column) => {

      if (column.prop === 'action') {
        column.minWidth = 80;
        column.sortable = false;
        return;
      }

      if (column.rwidth > 0) {
        column.minWidth = column.rwidth;
        column.maxWidth = column.rwidth;
        return;
      }

      const maxLength = rows.reduce((max, row) => {
        let value = row[column.prop] || '';

        // Si `column.props` existe, encuentra el valor más largo basado en `props`
        if (column.props && column.props.length > 0) {
          column.props.forEach((prop) => {
            value = row[prop.prop] || '';
          });
          return value && value.length > max ? value.length : max;
        }

        // Si `column.prop` es una cadena con propiedades anidadas (e.g., "user.name")
        const props = column.prop.split('.');
        if (props.length > 1) {
          props.forEach((prop) => {
            value = value ? value[prop] : '';
          });
          return value && value.length > max ? value.length : max;
        }

        // Si `column.prop` es una propiedad simple
        value = row[column.prop] || '';
        return value.length > max ? value.length : max;
      }, 0);

      if (maxLength < 25) {
        column.minWidth = 200;
        column.maxWidth = 200;
      } else if (maxLength > 50 && maxLength < 100) {
        column.minWidth = 450;
        column.maxWidth = 450;
      } else {
        column.minWidth = 300;
        column.maxWidth = 300;
      }

    });

  }

  getLargestProp(column: any): any {
    if (!column.props || column.props.length === 0) {
      return null;
    }
    return column.props.reduce((largest, current) => {
      return current.index > largest.index ? current : largest;
    });
  }

  sanitizerHtml(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  // Método para manejar la selección de filas
  onSelect() {
    this.selected.emit(this.selecteds);
  }

  createInjector(row: any): Injector {
    // return Injector.create({
    //   providers: [{ provide: 'row', useValue: row }],
    //   parent: this.injector
    // });
    const rowId = row.tableId;
    if (rowId === null || rowId === undefined) {
      return this.createActualInjector(row);
    }

    if (this.injectorCache.has(rowId)) {
      return this.injectorCache.get(rowId)!;
    } else {
      const injector = this.createActualInjector(row);
      this.injectorCache.set(rowId, injector);
      return injector;
    }
  }

  private createActualInjector(row: any): Injector {
    return Injector.create({
      providers: [{ provide: 'row', useValue: row }],
      parent: this.injector
    });
  }

  localRows() {
    if (!this.local) return;
    if (this.crows.length === 0 || this.crows < this.rows) {
      this.crows = [...this.rows];
    } else {
      this.rows = [...this.crows];
    }

    //Aplicar la paginacion
    // const start = (this.page - 1) * this.limit;
    // const end = start + this.limit;
    // this.rows = this.crows.slice(start, end);
    // this.total = this.crows.length;

    // Aplicar el ordenamiento
    if (this.sort) {
      this.rows.sort((a, b) => {
        const aValue = a[this.sort];
        const bValue = b[this.sort];

        if (this.order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    // Aplicar el filtrado
    let filteredRows = [...this.crows];
    if (this.search) {
      filteredRows = this.crows.filter((row) => {
        return this.columns.some(column => {
          const value = row[column.prop];
          return typeof value === 'string' &&
            value.toLowerCase().includes(this.search.toLowerCase());
        });
      });
    }

    // Actualizar el total con los elementos filtrados
    this.total = filteredRows.length;
    this.filteredTotal.emit(filteredRows.length);

    // Aplicar la paginación después del filtrado
    const start = (this.page - 1) * this.limit;
    const end = start + this.limit;
    this.rows = filteredRows.slice(start, end);
  }

  getColumns() {
    return this.columns.filter((column) => column.col);
  }

  onChange(event: any, column: any) {
    if (column.change && typeof column.change === 'function') {
      column.change(column.prop, this.filterForm);
    }
  }

  onCheckbox(row: any) {
    let key = this.columns.find((column) => column.checkbox || column.isAdd).prop;

    if (!row.selected) {
      this.selecteds = this.selecteds.filter((item) => item[key] !== row[key]);
    } else {
      this.selecteds.push(row);
    }
    this.selected.emit(this.selecteds);
  }

  // Método para manejar el evento de clic en una fila

  @ViewChild('table') table: any;
  @ViewChild('tableContainer') tableContainer: ElementRef;

  // Configuración de anchos
  private readonly MIN_COLUMN_WIDTH = 70;
  private readonly MAX_COLUMN_WIDTH = 800;
  private readonly PADDING = 32;
  private readonly DEFAULT_CHECKBOX_WIDTH = 48;  // Ancho para columnas de checkbox
  private readonly DEFAULT_ACTION_WIDTH = 70;

  private resizeTimeout: any;

  @HostListener('window:resize')
  onResize(): void {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.calculateColumnsWidth();
    }, 200); // Adjust delay as needed
  }

  calculateColumnsWidth(retryCount = 0): void {

    if (!this.columns?.length || !this.tableContainer) {
      if (retryCount < 5) {
        setTimeout(() => this.calculateColumnsWidth(retryCount + 1), 100);
      }
      return;
    }

    const containerWidth = this.tableContainer.nativeElement.offsetWidth;
    if (containerWidth === 0 && retryCount < 5) {
      setTimeout(() => this.calculateColumnsWidth(retryCount + 1), 100);
      return;
    }

    // 1. Clasificar columnas
    const { fixedColumns, expandableColumns, normalColumns } = this.classifyColumns();

    // 2. Calcular espacio ocupado por columnas fijas
    const fixedWidth = fixedColumns.reduce((sum, col) => sum + this.getFixedColumnWidth(col), 0);

    // 3. Calcular ancho disponible
    const availableWidth = containerWidth - fixedWidth;

    // 4. Procesar columnas expandibles
    this.processExpandableColumns(expandableColumns, availableWidth);

    // 5. Procesar columnas normales
    this.processNormalColumns(normalColumns, availableWidth, expandableColumns.length > 0);

    // 6. Configurar columnas fijas
    fixedColumns.forEach(col => this.configureFixedColumn(col));

    // 7. Forzar actualización
    this.updateTableLayout();
  }

  private classifyColumns() {
    return {
      fixedColumns: this.columns.filter(col =>
        ['action', 'checkbox'].includes(col.prop) || col.frozenLeft || col.frozenRight
      ),
      expandableColumns: this.columns.filter(col =>
        col.expand || col.autoExpand || (col.flexGrow && col.flexGrow > 0)
      ),
      normalColumns: this.columns.filter(col =>
        !['action', 'checkbox'].includes(col.prop) &&
        !col.frozenLeft &&
        !col.frozenRight &&
        !col.expand &&
        !col.autoExpand &&
        (!col.flexGrow || col.flexGrow === 0)
      )
    };
  }

  private getFixedColumnWidth(col: any): number {
    if (col.prop === 'checkbox') return this.DEFAULT_CHECKBOX_WIDTH;
    if (col.prop === 'action' && !col.lineal) return this.DEFAULT_ACTION_WIDTH;
    if (col.width) return col.width;
    if (col.rwidth) return col.rwidth;
    return this.MIN_COLUMN_WIDTH;
  }

  private processExpandableColumns(columns: any[], availableWidth: number): void {
    if (columns.length === 0) return;

    // Calcular ancho total de contenido no expandible
    const nonExpandableWidth = this.columns
      .filter(col => !col.expand && !col.autoExpand && (!col.flexGrow || col.flexGrow === 0))
      .reduce((sum, col) => sum + (col.width || this.MIN_COLUMN_WIDTH), 0);

    const remainingSpace = Math.max(availableWidth - nonExpandableWidth, 0);

    // Distribuir espacio entre columnas expandibles
    const totalFlexGrow = columns.reduce((sum, col) => sum + (col.flexGrow || 1), 0);
    const flexUnit = remainingSpace / totalFlexGrow;

    columns.forEach(col => {
      const flexFactor = col.flexGrow || 1;
      const calculatedWidth = flexUnit * flexFactor;

      // Si tiene autoExpand, calcular basado en contenido
      if (col.autoExpand) {
        const contentWidth = this.calculateContentWidth(col);
        col.width = Math.max(contentWidth, calculatedWidth);
      } else {
        col.width = calculatedWidth;
      }

      // Asegurar límites
      col.width = Math.max(
        this.MIN_COLUMN_WIDTH,
        Math.min(col.width, col.maxWidth || this.MAX_COLUMN_WIDTH)
      );

      col.minWidth = col.minWidth || this.MIN_COLUMN_WIDTH;
      col.maxWidth = col.maxWidth || this.MAX_COLUMN_WIDTH;
    });
  }

  private processNormalColumns(columns: any[], availableWidth: number, hasExpandableColumns: boolean): void {
    if (columns.length === 0) return;

    // Calcular ancho de contenido
    const contentWidths = columns.map(col => this.calculateContentWidth(col));
    const totalContentWidth = contentWidths.reduce((sum, width) => sum + width, 0);

    // Si hay columnas expandibles, estas ya han ocupado su espacio
    if (hasExpandableColumns) {
      columns.forEach((col, i) => {
        col.width = contentWidths[i];
        col.minWidth = Math.min(contentWidths[i], col.maxWidth || this.MAX_COLUMN_WIDTH);
      });
    } else {
      // Distribuir espacio normalmente
      if (totalContentWidth > availableWidth) {
        columns.forEach((col, i) => {
          col.width = contentWidths[i];
          col.minWidth = Math.min(contentWidths[i], col.maxWidth || this.MAX_COLUMN_WIDTH);
        });
      } else {
        const remainingSpace = availableWidth - totalContentWidth;
        const extraPerColumn = remainingSpace / columns.length;

        columns.forEach((col, i) => {
          col.width = contentWidths[i] + extraPerColumn;
          col.minWidth = Math.min(contentWidths[i], col.maxWidth || this.MAX_COLUMN_WIDTH);
        });
      }
    }
  }

  private calculateContentWidth(column: any): number {
    // Si tiene ancho definido, usarlo
    if (column.width) return column.width;
    if (column.rwidth) return column.rwidth;

    // Calcular basado en encabezado
    const headerWidth = this.calculateTextWidth(column.name || column.prop) + this.PADDING;

    // Calcular basado en contenido
    let contentWidth = this.rows.reduce((max, row) => {
      const value = this.getCellValue(row, column);
      const textValue = column.format ? column.format(value) : value?.toString() || '';
      return Math.max(max, this.calculateTextWidth(textValue) + this.PADDING);
    }, 0);

    // Considerar props adicionales
    if (column.props?.length) {
      const propsWidth = this.rows.reduce((max, row) => {
        const values = column.props.map((prop: any) => this.getNestedValue(row, prop.prop));
        const combinedText = values.join(' ');
        return Math.max(max, this.calculateTextWidth(combinedText) + this.PADDING);
      }, 0);
      contentWidth = Math.max(contentWidth, propsWidth);
    }

    return Math.max(
      headerWidth,
      contentWidth,
      column.minWidth || this.MIN_COLUMN_WIDTH,
      column.maxWidth ? Math.min(column.maxWidth, this.MAX_COLUMN_WIDTH) : 0
    );
  }

  private configureFixedColumn(col: any): void {
    col.width = this.getFixedColumnWidth(col);
    col.minWidth = col.width;
    col.maxWidth = col.width;
    col.sortable = false;
    if (col.prop === 'checkbox') {
      col.name = col.name || 'Selección';
    }
  }

  private updateTableLayout(): void {
    // 1. Forzar cambio de referencia de las columnas
    this.columns = [...this.columns.map(col => ({ ...col }))];

    // 2. Detección de cambios
    this.cdr.detectChanges();

    // 3. Recalcular la tabla con timeout para asegurar ciclo de renderizado
    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
        this.table.recalculateColumns();

        // Forzar redibujado del viewport
        //this.table['cdr'].detectChanges();
        //this.table['innerViewport']['cdr'].detectChanges();

        // Opcional: Resetear offsets si es necesario
        this.table.offsetX = 0;
        this.table.offsetY = 0;
      }
    }, 50); // Aumenté el tiempo para asegurar el renderizado
  }

  private calculateTextWidth(text: string): number {
    // Crear elemento temporal para medir texto
    const element = document.createElement('span');
    element.style.visibility = 'hidden';
    element.style.whiteSpace = 'nowrap';
    element.style.font = '14px'; // Usar misma fuente que la tabla
    element.textContent = text;
    document.body.appendChild(element);
    const width = element.offsetWidth;
    document.body.removeChild(element);
    return width;
  }

  private getCellValue(row: any, column: any): any {
    if (column.props?.length) {
      return column.props.map(prop => this.getNestedValue(row, prop.prop)).join(' ');
    }
    return this.getNestedValue(row, column.prop);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p] ?? '', obj);
  }

  refreshTable(): void {
    if (this.table) {
      this.crows = [];
      this.table.recalculate(); // Recalcula las columnas y el viewport
      this.table.recalculateColumns(); // Opcional: recalcula las columnas
      this.cdr.detectChanges(); // Fuerza la detección de cambios
    }
  }

  clearField(fieldProp: string): void {
    this.filterForm.patchValue({ [fieldProp]: '' });
    this.onSearchSubmit();
  }

  getClearField(prop): any {
    return this.filterForm.value[prop];
  }

  getOptions(filed): any[] {

    let options = filed.options;

    if (typeof filed.options === 'function') {
      options = filed.options(filed)
      if (options && options.length > 0) {
        filed.options = options;
      }
    }

    return options;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    let target = event.target as HTMLElement;

    if (target.classList.contains('btn-circle-action')) {
      const button = target.closest('.btn-circle-action') as HTMLElement;
      if (button) {
        const prop = button.getAttribute('data-prop');
        const index = button.getAttribute('data-index');

        const col: any = this.columns.find(c => c.prop === prop);
        if (col && col.customAction && typeof col.customAction.action === 'function') {
          const row = this.rows[Number(index)];
          const injector = this.createInjector(row);
          col.customAction.action(injector, row, index);
        }
        return;
      }
    }

    while (target && !target.classList.contains('link-action')) {
      target = target.parentElement;
    }
    if (target && target.classList.contains('link-action')) {
      const linkClass = Array.from(target.classList).find(cls => cls.startsWith('href-'));
      if (linkClass) {
        const href = linkClass.replace('href-', '');
        this.router.navigate([href]);
      }
    }
  }

  clearSelection() {
    this.selecteds = [];
    this.rows.forEach(row => {
      row.selected = false;
    });
    this.selected.emit(this.selecteds);
  }

  getTextError(col): string {

    if (col && typeof col.error === 'function') {
      return col.error(col.prop, this.filterForm);
    }

    if (this.filterForm.get(col.prop)?.hasError('required')) {
      return 'El campo es requerido';
    }
    return '';
  }

}
