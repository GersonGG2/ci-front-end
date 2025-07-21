import { inject, Injectable } from '@angular/core';
import { Notification } from './notification';
import { notifications } from './notification-data';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root' // 🔹 Esto hace que el servicio esté disponible en toda la aplicación
})
export class NotificationService {
  public notifications: Notification[] = notifications;
  private http = inject(HttpClient);



  async getNotifications(filters: any = {}): Promise<any> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params = params.set(key, filters[key]);
      }
    });

    const url = `${environment.tip.notifications.getNotifications}`;
    return await firstValueFrom(this.http.get(url, { params }));
  }

  public deleteNotification(titulo: string): void {
    this.notifications = this.notifications.filter(notification => notification.titulo !== titulo);
  }

  async updateNotification(id: number, data: any): Promise<any> {
    const url = `${environment.tip.notifications.getNotifications}/${id}`;
    return await firstValueFrom(this.http.patch(url, data));
  }


  async markNotificationReadStatus(id: number, isRead: boolean): Promise<any> {
    const status = isRead ? 'read' : 'unread';
    return this.updateNotification(id, { status });
  }

}
