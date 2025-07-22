import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class UsuariosService {
  private http = inject(HttpClient);

  async getAllUsuarios(page: number = 1, limit: number = 10, filters: any = {}): Promise<any> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    const url = `${environment.itz.usuarios.getAll}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }
  async createUsuario(data: any): Promise<any> {
    const url = `${environment.itz.usuarios.create}`;
    return await firstValueFrom(this.http.post(url, data));
  }

  async updateUsuario(id: number, data: any): Promise<any> {
    const url = `${environment.itz.usuarios.update}${id}`;
    return await firstValueFrom(this.http.patch(url, data));
  }

  async deleteUsuario(id: number): Promise<any> {
    const url = `${environment.itz.usuarios.delete}${id}`;
    return await firstValueFrom(this.http.delete(url));
  }

  async replaceRoles(id: number, data: { roleIds: number[] }): Promise<any> {
    const url = `${environment.itz.usuarios.replaceRoles}${id}/roles`;
    return await firstValueFrom(this.http.patch(url, data));
  }
}
