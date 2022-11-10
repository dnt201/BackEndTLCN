import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/services/auth.service';

@Injectable()
export class NotificationService {
  constructor(private readonly authService: AuthService) {}

  async getUserFromSocket(socket: Socket) {
    try {
      const authorization = socket.handshake.headers.authorization;
      if (!authorization) throw new Error(`Invalid credentials`);
      const authToken = authorization.split(' ')[1];
      const user = await this.authService.getUserFromAuthToken(authToken);

      if (!user) {
        socket.disconnect();
        throw new Error('Invalid credentials.');
      } else return user;
    } catch (error) {
      throw new WsException(error.message);
    }
  }
}
