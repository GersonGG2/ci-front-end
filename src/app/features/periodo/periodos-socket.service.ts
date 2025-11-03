import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PeriodosSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // Cambia la URL si tu backend está en otro host
  }

  // Escuchar cuando se apertura un periodo
  onPeriodoAperturado(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('periodoAperturado', (data) => {
        observer.next(data);
      });
    });
  }

  // 🔥 Escuchar cuando se cierra un periodo
  onPeriodoCerrado(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('periodoCerrado', (data) => {
        observer.next(data);
      });
    });
  }

  // 🔥 Desconectar socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // 🔥 Reconectar socket
  connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }
}