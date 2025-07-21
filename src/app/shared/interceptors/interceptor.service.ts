import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';
import { AuthGuard } from 'src/app/features/auth0/auth.guard';
import { Session } from 'src/app/helpers/session.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private spinnerService: SpinnerService,
    private auth: AuthGuard) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.auth.getToken();
    const session = Session.getSession();

    let request = req;
    if (token) {
      request = req.clone({
        setHeaders: {
          "session": session,
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Excluir si la URL contiene ambos '/file/' y '/metadata'
    const shouldExclude = false;//req.url.includes('/file/') && req.url.includes('/metadata');

    if (!shouldExclude) {
      if (this.activeRequests === 0) {
        this.spinnerService.loadSpinner();
      }
      this.activeRequests++;
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!shouldExclude) {
          setTimeout(() => {
            this.activeRequests--;
            if (this.activeRequests === 0) {
              this.spinnerService.stopSpinner();
            }
          }, 500);
        }
      })
    );
  }


}