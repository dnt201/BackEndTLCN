import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/services/auth.service';
import { SocketConnectionService } from 'src/modules/connection/services/socketConnection.service';

@Injectable()
@WebSocketGateway()
export class NotificationService {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly connectStore: SocketConnectionService,
  ) {}

  async getUserFromSocket(socket: Socket) {
    try {
      const authorization = socket.handshake.headers.authorization;
      if (!authorization) throw new Error(`Invalid credentials`);
      const authToken = authorization.split(' ')[1];
      const user = await this.authService.getUserFromAuthToken(authToken);

      if (!user) {
        socket.disconnect();
        throw new Error('Invalid credentials');
      } else return user;
    } catch (error) {
      return error.message;
    }
  }

  async sendNotification(notificationType: string, userId: string) {
    const socketToken = await this.connectStore.getConnection(userId);

    if (socketToken) {
      this.server.sockets
        .to(socketToken)
        .emit(notificationType, `Recieved Notification`);
    }
  }
}
