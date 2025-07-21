import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericTableComponent } from '../generic-table/generictable.component';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-generic-selector',
  templateUrl: './genericselector.component.html',
  styleUrls: ['./genericselector.component.scss'],
  imports: [CommonModule, GenericTableComponent]
})
export class GenericSelectorComponent implements OnInit {

  @Input() rows: any[] = [];
  @Input() columns: any = [];
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() loading: boolean = false;
  @Input() placeholder: string = 'Buscar...';
  @Input() selector: 'single' | 'multiple' | 'checkbox' = null;
  @Input() title: string = 'Seleccionar';
  @Input() isRender: boolean = true;
  @Input() local: boolean = false;
  @Input() initSearch: string = '';
  @Input() btnRefresh: boolean = false;
  @Input() clearIconClass: string | undefined;
  @Input() parameters: boolean = false;
  @Input() showRefreshIcon: boolean = false;
  @Input() showSearchIcon: boolean = false;

  @Output() filter: EventEmitter<any> = new EventEmitter<any>();
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();

  selectedRow: any = null;

  constructor(public activeModal: NgbActiveModal, public modalStateService: ModalStateService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.modalStateService.setModalState(true); // Marca el modal como abierto
  }

  ngOnDestroy(): void {
    this.modalStateService.setModalState(false); // Marca el modal como cerrado
  }

  close(accept: boolean = false) {
    if (accept && !this.selectedRow) {
      this.toastr.warning('Selecciona un registro para continunar.', 'Advertencia');
      return
    } else if(accept) this.selected.emit(this.selectedRow);
    this.activeModal.close();
  }

  onSelect(event) {
    this.selectedRow = event;
  }

  onFilter(event) {
    this.filter.emit(event);
  }

  doubleClick(event) {
    this.selectedRow = event;
    this.close(true);
  }

}

@Injectable({
  providedIn: 'root'
})
export class ModalStateService {
  private isModalOpen = false;

  setModalState(state: boolean): void {
    this.isModalOpen = state;
  }

  getModalState(): boolean {
    return this.isModalOpen;
  }
}
