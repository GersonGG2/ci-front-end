import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkOrdersHelperService {
  private http = inject(HttpClient);

  async getReceiptsList(filters: any = {}): Promise<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    const url = `${environment.tip.workOrders.receiptList}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async getReceiptById(rcvHeaderId: number, odtHeaderId: number): Promise<any> {
    try {
      const url = `${environment.tip.workOrders.receiptDetail}/${rcvHeaderId}/${odtHeaderId}`;
      return await firstValueFrom(this.http.get(url));
    } catch (error) {
      console.error('Error al obtener el recibo:', error);
      throw error;
    }
  }
  async downloadReceiptPdf(rcvHeaderId: number, odtHeaderId: number): Promise<Blob> {
    try {
      const url = `${environment.tip.workOrders.planDispatchPrint
        .replace('{1}', rcvHeaderId.toString()).replace('{0}', odtHeaderId.toString())}`;

      return await firstValueFrom(this.http.get(url, { responseType: 'blob' }));
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de línea de un recibo
   * @param payload Datos del recibo y sus líneas según el formato de la API
   */
  async saveReceiptLineData(payload: any): Promise<any> {
    try {
      // La URL ya no incluye el rcvLineId en la ruta
      const url = `${environment.tip.workOrders.receiptSaveLineData}`;

      // Enviamos el payload completo directamente
      return await firstValueFrom(this.http.patch(url, payload));
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      throw error;
    }
  }

  async getDispatchOfMaterialsDetail(filters: any = {}): Promise<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    const url = `${environment.tip.workOrders.planDetail}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  // Agregar este método al servicio si aún no existe
  async updateReceiptBranch(headerId: number, branchId: number): Promise<any> {
    try {
      const url = `${environment.tip.workOrders.receiptBranchUpdate}`;
      const payload = {
        id: headerId,  // Cambiado de rcvHeaderId a headerId
        from: "ODT_PLAN",
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

  async updateReceiptStatus(headerId: number, status: string): Promise<any> {
    try {
      const url = `${environment.tip.workOrders.receiptUpdateStatus}`;

      const payload = {
        headerId: headerId,
        lineStatus: status // Debe ser 'Aprobado' o 'Rechazado'
      };
      return await firstValueFrom(this.http.patch(url, payload));
    } catch (error) {
      console.error('Error al actualizar el estado del recibo:', error);
      throw error;
    }
  }


}
