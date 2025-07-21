import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WorkOrderService {
  private http = inject(HttpClient);

  async getPlanData(headerId: string, lineId: string): Promise<any> {
    let params = new HttpParams().set('headerId', headerId).set('lineId', lineId);

    const url = `${environment.tip.workOrders.planData}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async postAddLine(payload: any): Promise<any> {
    const url = `${environment.tip.workOrders.planAddLine}`;
    try {
      return await firstValueFrom(this.http.post(url, payload));
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }

  async getPlanHeaderData(headerId: string): Promise<any> {
    let params = new HttpParams().set('id', headerId);

    const url = `${environment.tip.workOrders.planHeaderData}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async postAssignHeaderTeam(payload: any): Promise<any> {
    const url = `${environment.tip.workOrders.planAssignHeaderTeam}`;
    try {
      return await firstValueFrom(this.http.post(url, payload));
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }

  async postZonesDamages(sysSelectLovI: any) {
    let url = environment.tip.configuration.sysSelectLov;
    try {
      return await firstValueFrom(this.http.post(url, sysSelectLovI));
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }

  async updateBranch(headerId: number, branchId: number): Promise<any> {
    try {
      const url = `${environment.tip.workOrders.receiptBranchUpdate}`;
      const payload = {
        id: headerId,
        from: 'ODT_PLAN',
        branch: {
          branchId: branchId
        }
      };
      return await firstValueFrom(this.http.post(url, payload));
    } catch (error) {
      console.error('Error al actualizar la sucursal:', error);
      throw error;
    }
  }

  async getQuantityTeam(headerId: string, lineId: string): Promise<any> {
    let params = new HttpParams().set('headerId', headerId).set('lineId', lineId);

    const url = `${environment.tip.workOrders.planQuantityTeam}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async patchQuantityTeam(payload: any): Promise<any> {
    const url = `${environment.tip.workOrders.planSaveQuantityTeam}`;
    try {
      return await firstValueFrom(this.http.patch(url, payload));
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }

  async getReceiptDetails(headerId: string): Promise<any> {
    const url = `${environment.tip.workOrders.planReceiptDetails}${headerId}`;
    return await firstValueFrom(this.http.get(url, {}));
  }

  async getDispatchViewReceipt(headerId: string): Promise<any> {
    let params = new HttpParams().set('headerId', headerId.toString());

    const url = `${environment.tip.workOrders.planDispatchViewReceipt}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async getPlanDispatchPrint(headerId: number, rcvHeaderId: number): Promise<Blob> {
    const url = environment.tip.workOrders.planDispatchPrint.replace('{0}', headerId.toString()).replace('{1}', rcvHeaderId.toString());

    return await firstValueFrom(
      this.http.get(url, {
        responseType: 'blob'
      })
    );
  }

  async patchStatusLine(payload: any): Promise<any> {
    const url = `${environment.tip.workOrders.planStatusLine}`;
    try {
      return await firstValueFrom(this.http.patch(url, payload));
    } catch (error) {
      console.error('Error:', error);
      return error;
    }
  }
}
