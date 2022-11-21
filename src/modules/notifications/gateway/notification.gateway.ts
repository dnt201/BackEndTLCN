import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketConnectionService } from 'src/modules/connection/services/socketConnection.service';
import { NotificationService } from '../service/notification.service';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly connectStore: SocketConnectionService,
  ) {}

  async handleConnection(socket: Socket) {
    const getUser = await this.notificationService.getUserFromSocket(socket);
    if (getUser === 'Invalid credentials') socket.disconnect();
    else {
      const socketToken = socket.id;

      await this.connectStore.connect({
        userId: getUser.id,
        socketToken: socketToken,
      });
    }
  }

  async handleDisconnect(socket: Socket) {
    const getUser = await this.notificationService.getUserFromSocket(socket);
    if (getUser === 'Invalid credentials') socket.disconnect();
    else {
      await this.connectStore.disconnect(getUser.id);
    }
  }

  // @SubscribeMessage('sendNotification')
  // async listenForMessages(@MessageBody() data: Example) {
  //   const userWillSent = data.userId;
  //   const userToken = await this.connectStore.getConnection(userWillSent);

  //   this.server.sockets.to(userToken).emit('receiveNotification', data.data);
  // }

  @SubscribeMessage('receiveNotification')
  async receiveNotification(@MessageBody() notificationId: string) {
    this.notificationService.receiveNotification(notificationId);
  }

  @SubscribeMessage('clickNotification')
  async clickNotification(@MessageBody() notificationId: string) {
    this.notificationService.clickNotification(notificationId);
  }
}
