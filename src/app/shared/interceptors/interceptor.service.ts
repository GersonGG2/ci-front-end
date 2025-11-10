import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private spinnerService: SpinnerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo añade el token si existe y la petición es a tu API
    let request = req;
    const token = localStorage.getItem('token');
    if (token && req.url.includes('https://sgci-itz.onrender.com')) {
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Spinner control
    if (this.activeRequests === 0) {
      this.spinnerService.loadSpinner();
    }
    this.activeRequests++;

    return next.handle(request).pipe(
      finalize(() => {
        setTimeout(() => {
          this.activeRequests--;
          if (this.activeRequests === 0) {
            this.spinnerService.stopSpinner();
          }
        }, 500);
      })
    );
  }
}