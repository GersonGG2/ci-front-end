import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class PeriodosService {
  private http = inject(HttpClient);

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

  async createPeriodo(data: any): Promise<any> {
    const url = `${environment.itz.periodos.create}`;
    return await firstValueFrom(this.http.post(url, data));
  }

  async updatePeriodo(id: number, data: any): Promise<any> {
    const url = `${environment.itz.periodos.update}${id}`;
    return await firstValueFrom(this.http.patch(url, data));
  }

  async deletePeriodo(id: number): Promise<any> {
    const url = `${environment.itz.periodos.delete}${id}`;
    return await firstValueFrom(this.http.delete(url));
  }

  async getPeriodoById(id: number | string): Promise<any> {
    const url = `${environment.itz.periodos.getById}${id}`;
    return await firstValueFrom(this.http.get(url));
  }

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

  async getCursoById(id: number | string): Promise<any> {
    const url = `${environment.itz.cursos.getById}${id}`;
    return await firstValueFrom(this.http.get(url));
  }

  async getAllInscripciones(filters: any = {}): Promise<any> {
    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params = params.set(key, filters[key]);
    });
    const url = environment.itz.inscripciones.getAll;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  getAllAcademias(page: number = 1, limit: number = 20) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<any>(environment.itz.academias.getAll, { params });
  }

  async createInscripcion(data: any): Promise<any> {
    const url = environment.itz.inscripciones.create;
    return await firstValueFrom(this.http.post(url, data));
  }

  async getDocentes(page = 1, limit = 10, searchValue = ''): Promise<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('role', 'Docente');
    if (searchValue) params = params.set('searchValue', searchValue);
    const url = environment.itz.usuarios.getAll;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  // Actualizar estado de inscripción
  async updateInscripcion(data: any): Promise<any> {
    const url = `${environment.itz.inscripciones.update}${data.id}`;
    return this.http.patch(url, { estado: data.estado }).toPromise();
  }

  async getAllInstructores(page = 1, limit = 50, searchValue: string = ''): Promise<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Agregar filtro de búsqueda si viene
    if (searchValue) {
      params = params.set('searchValue', searchValue);
    }

    const url = environment.itz.usuarios.getAll;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async removeInscripcion(id: number | string): Promise<any> {
    const url = `${environment.itz.inscripciones.delete}${id}`;
    return await firstValueFrom(this.http.delete(url));
  }


  async aprobarMultiplesCursos(cursosIds: number[], nuevoEstado: string): Promise<any> {
    const url = environment.itz.cursos.aprobarMultiples;
    return await firstValueFrom(this.http.post(url, { cursosIds, nuevoEstado }));
  }

  async inscribirDocente(data: any): Promise<any> {
    const url = environment.itz.inscripciones.create;
    return await firstValueFrom(this.http.post(url, data));
  }

  async cambiarEstadoDecursoJefe(payload: any): Promise<any> {
    const url = `${environment.itz.cursos.cambiarEstadoDecursoJefe}`;
    return await firstValueFrom(this.http.post(url, payload));
  }

  async eliminarMultiplesCursos(cursosIds: number[]): Promise<any> {
    const url = environment.itz.cursos.eliminarMultiples;
    return await firstValueFrom(
      this.http.post(url, { cursosIds })
    );
  }
}
