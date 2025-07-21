import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

type HttpResponse = { data: any; error: any; status: boolean; url: string };

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private http: HttpClient) {}

  post(url: string, body: any, headers: { key: string; value: string }[]) {
    let _headers = {} as any;
    headers.forEach((elem) => (_headers[elem.key] = elem.value));
    return new Promise<HttpResponse>((resolve, reject) => {
      let result: HttpResponse = { data: null, error: null, status: false, url };
      this.http
        .post<any>(url, !!body ? JSON.stringify(body) : null, { headers: new HttpHeaders(_headers) })
        .pipe(map((data) => data))
        .subscribe({
          next: (value) => {
            result.data = value;
            result.status = true;
            resolve(result);
          },
          error: (err) => {
            result.error = err;
            resolve(result);
          }
        });
    });
  }

  get(url: string, headers: { key: string; value: string }[]) {
    let _headers = {} as any;
    headers.forEach((elem) => (_headers[elem.key] = elem.value));
    return new Promise<HttpResponse>((resolve, reject) => {
      let result: HttpResponse = { data: null, error: null, status: false, url };
      this.http
        .get<any>(url, { headers: new HttpHeaders(_headers) })
        .pipe(map((data) => data))
        .subscribe({
          next: (value) => {
            result.data = value;
            result.status = true;
            resolve(result);
          },
          error: (err) => {
            result.error = err;
            resolve(result);
          }
        });
    });
  }

  put(url: string, body: any, headers: { key: string; value: string }[]) {
    let _headers = {} as any;
    headers.forEach((elem) => (_headers[elem.key] = elem.value));
    return new Promise<HttpResponse>((resolve, reject) => {
      let result: HttpResponse = { data: null, error: null, status: false, url };
      this.http
        .put<any>(url, !!body ? JSON.stringify(body) : null, { headers: new HttpHeaders(_headers) })
        .pipe(map((data) => data))
        .subscribe({
          next: (value) => {
            result.data = value;
            result.status = true;
            resolve(result);
          },
          error: (err) => {
            result.error = err;
            resolve(result);
          }
        });
    });
  }

  patch(url: string, body: any, headers: { key: string; value: string }[]) {
    let _headers = {} as any;
    headers.forEach((elem) => (_headers[elem.key] = elem.value));
    return new Promise<HttpResponse>((resolve, reject) => {
      let result: HttpResponse = { data: null, error: null, status: false, url };
      this.http
        .patch<any>(url, !!body ? JSON.stringify(body) : null, { headers: new HttpHeaders(_headers) })
        .pipe(map((data) => data))
        .subscribe({
          next: (value) => {
            result.data = value;
            result.status = true;
            resolve(result);
          },
          error: (err) => {
            result.error = err;
            resolve(result);
          }
        });
    });
  }

  delete(url: string, headers: { key: string; value: string }[]) {
    let _headers = {} as any;
    headers.forEach((elem) => (_headers[elem.key] = elem.value));
    return new Promise<HttpResponse>((resolve, reject) => {
      let result: HttpResponse = { data: null, error: null, status: false, url };
      this.http
        .delete<any>(url, { headers: new HttpHeaders(_headers) })
        .pipe(map((data) => data))
        .subscribe({
          next: (value) => {
            result.data = value;
            result.status = true;
            resolve(result);
          },
          error: (err) => {
            result.error = err;
            resolve(result);
          }
        });
    });
  }
}
