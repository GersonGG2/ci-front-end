import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.itz.auth.login; // Necesitarás añadir esta URL en el environment

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.itz.auth.login}`, { email: username, password })
      .pipe(
        map(response => {
          // Guardar token
          localStorage.setItem('token', response.access_token);

          // Guardar datos del usuario
          localStorage.setItem('user', JSON.stringify(response.user));

          // Guardar banderas de roles - estas vienen del backend
          localStorage.setItem('isAdmin', JSON.stringify(response.isAdmin || false));
          localStorage.setItem('isDocente', JSON.stringify(response.isDocente || false));
          localStorage.setItem('isInstructor', JSON.stringify(response.isInstructor || false));
          localStorage.setItem('isJefe', JSON.stringify(response.isJefe || false));

          return response;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Redirige al login
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }


}