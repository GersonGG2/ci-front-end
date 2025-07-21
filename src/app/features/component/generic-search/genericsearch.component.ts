import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-generic-search',
  templateUrl: './genericsearch.component.html',
  styleUrls: ['./genericsearch.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class GenericSearchComponent {
  @Input() form!: FormGroup;
  @Input() controlName: string = 'input';
  @Input() placeholder: string = 'Buscar...';
  @Input() label: string = 'Numero Eco';

  @Output() search = new EventEmitter<Event>();
  @Output() openModal = new EventEmitter<void>();

  get isValid() {
    return this.form?.controls[this.controlName]?.value?.length > 0;
  }

  clearField() {
    this.form.controls[this.controlName].setValue('');
  }
  
  escape = false;
  enter = false;
  button = false;

  onSearch(type, event) {

    if (this.button) return;

    const value = event?.target?.value || this.form.controls[this.controlName].value;

    if (type == 2 && (this.escape || this.enter )) return;
    if (type == 1) this.enter = true;
    event.preventDefault();
    this.search.emit(value);
  }

  onInputFocus(event) {
    this.escape = false;
    this.enter = false;
    this.button = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.escape = true;
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const isButton = (event.target as HTMLElement).closest('button') !== null;
    this.button = isButton
  }

}