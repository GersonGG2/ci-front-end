import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CursosService {
  private http = inject(HttpClient);

  async getAllCursos(page: number = 1, limit: number = 10, filters: any = {}): Promise<any> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    const url = `${environment.itz.cursos.getAll}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async createCurso(data: any): Promise<any> {
    const url = `${environment.itz.cursos.create}`;
    return await firstValueFrom(this.http.post(url, data));
  }
  async updateCurso(id: number | string, data: any): Promise<any> {
    const url = `${environment.itz.cursos.update}${id}`;
    return await firstValueFrom(this.http.patch(url, data));
  }

  async deleteCurso(id: number | string): Promise<any> {
    const url = `${environment.itz.cursos.delete}${id}`;
    return await firstValueFrom(this.http.delete(url));
  }
  async getAllPeriodos(page: number = 1, limit: number = 10, filters: any = {}): Promise<any> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });
    const url = `${environment.itz.periodos.getAll}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  getAllAcademias(page: number = 1, limit: number = 20) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(environment.itz.academias.getAll, { params });
  }

  async getAllInstructores(page = 1, limit = 50, searchValue: string = ''): Promise<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('role', 'Instructor');

    // Agregar filtro de búsqueda si viene
    if (searchValue) {
      params = params.set('searchValue', searchValue);
    }

    const url = environment.itz.usuarios.getAll;
    return await firstValueFrom(this.http.get(url, { params }));
  }
}
