import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Cambia la URL si tu backend está en otro host/puerto
    this.socket = io('http://localhost:3000');
  }

  // Escuchar eventos
  on<T>(eventName: string): Observable<T> {
    return new Observable<T>(subscriber => {
      this.socket.on(eventName, (data: T) => subscriber.next(data));
      // Limpia el listener al destruir el observable
      return () => this.socket.off(eventName);
    });
  }
}