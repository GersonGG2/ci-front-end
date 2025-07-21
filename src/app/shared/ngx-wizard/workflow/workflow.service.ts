import { inject, Injectable } from '@angular/core';
import { DamageDetailI, STEPS } from './workflow.model';
import { HttpService } from 'src/app/helpers/http.service';
import { DanioI } from 'src/app/shared/ngx-wizard/workflow/workflow.model';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Session } from 'src/app/helpers/session.service';

@Injectable()
export class WorkflowService {
  private httpService = inject(HttpService);
  private http = inject(HttpClient);

  async getIncomingInspection(id: string) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.preloadForm + '?id=' + id;
    return await this.httpService.get(ms, headers);
  }

  async getCustomerData(id: string) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.main + '/' + id + '/firmas';
    return await this.httpService.get(ms, headers);
  }

  async patchProcessStart(id: string) {
    const user = Session.getUser();
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.processStart + id + '/process-start';
    return await this.httpService.patch(ms, { userId: user.userId }, headers);
  }

  async getZonesDamages(zoneI: any) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.damages + 'zones?id=' + zoneI.headerId + '&zoneType=' + zoneI.zoneType;
    return await this.httpService.get(ms, headers);
  }

  async patchZonesDamages(zoneI: any) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.damages + zoneI.headerId + '/zones';
    return await this.httpService.patch(ms, zoneI, headers);
  }

  async getDetailDamages(danioI: DanioI) {
    if (!danioI.header_id) {
      throw new Error('El ID de la inspección es requerido');
    }
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.damageDetail + danioI.header_id + '?zoneType=' + danioI.zone_type + '&danoType=' + danioI.dano_type + '&danoOrder=' + danioI.dano_order;
    return await this.httpService.get(ms, headers);
  }

  async getDetailDamagesByItemCode(danioI: DanioI, itemCode: string) {
    if (!danioI.header_id) {
      throw new Error('El ID de la inspección es requerido');
    }
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.damageDetail + danioI.header_id + '?zoneType=' + danioI.zone_type + '&danoType=' + danioI.dano_type + '&danoOrder=' + danioI.dano_order + '&itemCode=' + itemCode;
    return await this.httpService.get(ms, headers);
  }

  async patchDetailDamages(damageDetailI: DamageDetailI, id) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.damageDetail + id;
    return await this.httpService.patch(ms, damageDetailI, headers);
  }

  async postZonesDamages(sysSelectLovI: any) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.configuration.sysSelectLov;
    return await this.httpService.post(ms, sysSelectLovI, headers);
  }

  getPlugins(eco: string, component: string) {
    return !!localStorage.getItem(eco + '-' + component + '-' + 'plugins') ? JSON.parse(localStorage.getItem(eco + '-' + component + '-' + 'plugins')) : null;
  }

  savePlugins(eco: string, component: string, plugins: any) {
    localStorage.setItem(eco + '-' + component + '-' + 'plugins', JSON.stringify(plugins));
  }

  getActivitiesByDamageId(eco: string, component: string, damageId: number) {
    let activities = {};
    let activitiesByDamageId = localStorage.getItem(eco + '-' + component + '-' + 'activitiesByDamageId');

    if (!!activitiesByDamageId) {
      JSON.parse(activitiesByDamageId).forEach((element: any) => {
        if (element.damageId == damageId) {
          activities = element;
        }
      });
    }

    return activities;
  }

  saveActivitiesByDamageId(eco: string, component: string, activitiesByDamageIdItem: any) {
    let activitiesByDamageIdStorage = localStorage.getItem(eco + '-' + component + '-' + 'activitiesByDamageId');
    let activitiesByDamageId = [];
    if (!!activitiesByDamageIdStorage) {
      activitiesByDamageId = JSON.parse(activitiesByDamageIdStorage).filter((item) => item.damageId !== activitiesByDamageIdItem.damageId);
    }
    activitiesByDamageId.push(activitiesByDamageIdItem);
    localStorage.setItem(eco + '-' + component + '-' + 'activitiesByDamageId', JSON.stringify(activitiesByDamageId));
  }

  private workflow = [
    { step: STEPS.information, valid: false },
    { step: STEPS.inspection, valid: false },
    { step: STEPS.inspectionSheet, valid: false },
    { step: STEPS.finish, valid: false }
  ];

  validateStep(step: string) {
    // If the state is found, set the valid field to true
    var found = false;
    for (var i = 0; i < this.workflow.length && !found; i++) {
      if (this.workflow[i].step === step) {
        found = this.workflow[i].valid = true;
      }
    }
  }

  resetSteps() {
    // Reset all the steps in the Workflow to be invalid
    this.workflow.forEach((element) => {
      element.valid = false;
    });
  }

  getFirstInvalidStep(step: string): string {
    // If all the previous steps are validated, return blank
    // Otherwise, return the first invalid step
    var found = false;
    var valid = true;
    var redirectToStep = '';
    for (var i = 0; i < this.workflow.length && !found && valid; i++) {
      let item = this.workflow[i];
      if (item.step === step) {
        found = true;
        redirectToStep = '';
      } else {
        valid = item.valid;
        redirectToStep = item.step;
      }
    }
    return redirectToStep;
  }

  async finishInspection(id: number) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    let ms = environment.tip.inspections.finish;
    return await this.httpService.patch(ms, { headerId: id }, headers);
  }

  async getEcoTire(filters: any = {}): Promise<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      params = params.set(key, filters[key]);
    });
    const url = `${environment.tip.configuration.ecoTire}`;
    try {
      return await firstValueFrom(this.http.get(url, { params }));
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getInspectionHistory(headerId: number): Promise<any> {
    const url = `${environment.tip.inspections.main}/${headerId}/history?sort=creationDate&order=DESC`;
    try {
      return await firstValueFrom(this.http.get(url));
    } catch (error) {
      console.error('Error al obtener el historial de la inspección:', error);
      return error;
    }
  }
}
