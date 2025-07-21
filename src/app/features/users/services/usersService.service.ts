import { inject, Injectable } from '@angular/core';
import { User } from './user';
import { users } from './users-data';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/helpers/http.service';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  public users: User[] = users;
  private httpService = inject(HttpService);
  private http = inject(HttpClient);

  public async getUsers(page = 1, limit = 7, sort = 'userId', order = 'ASC') {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    const params = new HttpParams().set('page', page).set('limit', limit).set('sort', sort).set('order', order);
    let ms = `${environment.tip.configuration.userList}?${params.toString()}`;
    return await this.httpService.get(ms, headers);
  }

  public async createUser(user: any): Promise<any> {
    const headers = [{ key: 'Content-Type', value: 'application/json' }];
    // const url = environment.tip.configuration.userCreate; // URL del endpoint
    const url = environment.tip.configuration.userCreate; // URL del endpoint
    return await this.httpService.post(url, user, headers);
  }

  public async updateUser(user: User) {
    let headers = [{ key: 'Content-Type', value: 'application/json' }];
    // Se asume que 'environment.tip.configuration.userUpdate' es la URL base para actualizar usuarios, por ejemplo: '/dyconfigurationws/api/sys_user_update'
    // let ms = `${environment.tip.configuration.userUpdate}/${user.userId}`;
    let ms = `${environment.tip.configuration.userUpdate}/${user.userId}`;
    return await this.httpService.put(ms, user, headers);
  }

  // Servicio (ideal con HttpClient):
  public deleteUser(userId: number): Observable<any> {
    const url = `${environment.tip.configuration.userDelete}/${userId}`;
    return this.http.delete(url);
  }


  async getUsersListFiltered(page: number = 1, limit: number = 10, filters: any = {}): Promise<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    const url = `${environment.tip.configuration.userList}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  // Metodo para obtener la lista de users con filtros de busqueda
  async getUsersList(filters: any = {}): Promise<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    const url = `${environment.tip.configuration.userList}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  async exportUsersExcel(): Promise<Blob> {
    const url = `${environment.tip.configuration.userExportExel}`;
    try {
      const response = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' }) // Solicita el archivo como Blob
      );
      return response;
    } catch (error) {
      console.error('Error al exportar el archivo Excel:', error);
      throw error;
    }
  }

  async getPreFormData(id: number): Promise<any> {
    const url = `${environment.tip.configuration.userListData}/${id}`;
    return await firstValueFrom(this.http.get(url));
  }

  async getUserAuth0ByEmail(email: string): Promise<any> {
    const url = `${environment.tip.security.auth0.byEmail}`;
    const encodedEmail = encodeURIComponent(email);
    const urlEncoded = url.replace('{email}', encodedEmail);
    return await firstValueFrom(this.http.get(urlEncoded));
  }

  async getUserByEmailSub(email: string, sub: string): Promise<any> {
    const url = `${environment.tip.security.userByEmailAuth0}`;
    const encodedEmail = encodeURIComponent(email);
    const encodedSub = encodeURIComponent(sub);
    const urlEncoded = url.replace('{email}', encodedEmail).replace('{auth0}', encodedSub);
    return await firstValueFrom(this.http.get(urlEncoded));
  }

   async createAuth0User(data: { email: string, name: string, nickName: string }): Promise<any> {
    const url = environment.tip.security.auth0.create;
    return await firstValueFrom(this.http.post(url, data));
  }
}
