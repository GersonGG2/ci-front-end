import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private http: HttpClient) { }

  async sendMail(key: string, recipients: string, subject: string, content: any, files: File[]): Promise<any> {
    const formData = new FormData();
    
    formData.append('key', key);
    formData.append('recipients', recipients);
    formData.append('subject', subject);
    formData.append('content', JSON.stringify(content));

    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    const url = `${environment.tip.notifications.sendMail}`;

    try {
      return await firstValueFrom(this.http.post(url, formData));
    } catch (error) {
      console.error('Error en sendMail:', error);
      throw error;
    }
  }


}


