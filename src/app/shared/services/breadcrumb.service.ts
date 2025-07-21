import { Location } from '@angular/common';
import { Injectable, signal } from '@angular/core';
import {FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Alert } from 'src/app/helpers/alerts';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  constructor(private router: Router, private location: Location) {}

  showModal = signal(false);
  message = signal('¿Estas seguro de cancelar este registro?');
  private saveCallback: (() => Promise<void>) | null = null;

  setMessage(message: string) {
    this.message.set(message);
  }

  setShowModal(showModal: boolean) {
    this.showModal.set(showModal);
  }

  setFormSubscribe(form: FormGroup) {
    form.valueChanges.subscribe(value => {
      this.showModal.set(true);
    });
  }

  setSaveCallback(callback: () => Promise<void>) {
    this.saveCallback = callback;
  }

  clearSaveCallback() {
    this.saveCallback = null;
  }

  async verifyCloseModal(modalReference: any) {
    if(this.showModal()) {
      if (await Alert.question('Confirmación', this.message())) {
        modalReference.dismiss();
      }
    } else modalReference.dismiss();
  }

  async verifyGoBack(urlBack: string, message: string = this.message()) {
    if (this.showModal()) {
      if (await Alert.question('Confirmación', message)) {
        await this.executeSaveAndGoBack(urlBack);
      }
    } else {
      await this.executeSaveAndGoBack(urlBack);
    }
  }

  private async executeSaveAndGoBack(urlBack: string) {
    try {
      if (this.saveCallback) {
        await this.saveCallback();
      }
    } catch (error) {
      console.error('Error al guardar antes de navegar:', error);
    } finally {
      this.goBack(urlBack);
    }
  }

  goBack(urlBack: string) {
    this.showModal.set(false);
    if (urlBack) this.router.navigate([urlBack]);
    else this.location.back();
  }

}
