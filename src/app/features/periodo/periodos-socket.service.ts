import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PeriodosSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // Cambia la URL si tu backend está en otro host
  }

  onPeriodoAperturado(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('periodoAperturado', (data) => {
        observer.next(data);
      });
    });
  }
}