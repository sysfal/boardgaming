import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  socket;

  constructor() {}

  setupSocketConnection() {
    this.socket = io(environment.SOCKET_ENDPOINT);

    this.socket.on('chat message', (data: string) => {
      console.log('chat message: ' + data);
    });

    this.socket.emit('chat message', 'Angular');
  }
}
