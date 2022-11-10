import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from '../service/notification.service';

@WebSocketGateway()
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationService: NotificationService) {}

  async handleConnection(socket: Socket) {
    await this.notificationService.getUserFromSocket(socket);
  }

  @SubscribeMessage('sendNotification')
  listenForMessages(@MessageBody() data: string) {
    this.server.sockets.emit('receiveNotification', data);
  }
}
