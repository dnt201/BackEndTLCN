import { UserAvatar } from './../../../common/dto/AvatarUser';
import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/services/auth.service';
import { SocketConnectionService } from 'src/modules/connection/services/socketConnection.service';
import { SettingService } from 'src/modules/settings/services/setting.service';
import { NotificationDTO } from '../dto/notification.dto';
import { NotificationPage } from '../dto/notificationPage.dto';
import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
@WebSocketGateway()
export class NotificationService {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly settingService: SettingService,
    private readonly notificationRepository: NotificationRepository,
    private readonly connectStore: SocketConnectionService,
  ) {}

  async getUserFromSocket(socket: Socket) {
    try {
      const authorization = socket.handshake.auth.token;
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

  async sendNotification(
    notificationType: string,
    notificationBody: object,
    userId: string,
  ) {
    const socketToken = await this.connectStore.getConnection(userId);

    this.logger.log(notificationType, notificationBody);

    if (socketToken) {
      this.server.sockets
        .to(socketToken)
        .emit(notificationType, notificationBody);
    }
  }

  async createNotification(notificationDTO: NotificationDTO, user: UserAvatar) {
    const maxAttempt = await this.settingService.getSettingValueByKeyAndGroup(
      'MAX_ATTEMPTS',
      'NOTIFICATION',
    );
    const timeOut = await this.settingService.getSettingValueByKeyAndGroup(
      'TIME_OUT',
      'NOTIFICATION',
    );

    const notification =
      await this.notificationRepository.createNewNotification({
        ...notificationDTO,
        maxAttempt: Number(maxAttempt),
        timeOut: Number(timeOut),
        userSend: user.id,
      });
    await this.notificationRepository.save(notification);

    await this.sendNotification(
      notification.type,
      { ...notification, userSend: user },
      notification.userId,
    );
  }

  async getNotification(notificationDTO: NotificationDTO) {
    return await this.notificationRepository.getNotification(notificationDTO);
  }

  async getNotifications(userId: string, page: NotificationPage) {
    return await this.notificationRepository.getNotifications(userId, page);
  }

  async removeNotification(notificationDTO: NotificationDTO) {
    const notification = await this.notificationRepository.getNotification(
      notificationDTO,
    );
    if (notification)
      await this.notificationRepository.removeNotification(notificationDTO);
  }

  async receiveNotification(notificationId: string) {
    const notification = await this.notificationRepository.findNotificationById(
      notificationId,
    );

    if (!notification) {
      throw new NotFoundException(
        `Not found notification with id: ${notificationId}`,
      );
    }

    await this.notificationRepository.receiveNotification(notificationId);
  }

  async clickNotification(notificationId: string) {
    const notification = await this.notificationRepository.findNotificationById(
      notificationId,
    );

    if (!notification) {
      throw new NotFoundException(
        `Not found notification with id: ${notificationId}`,
      );
    }

    await this.notificationRepository.clickNotification(notificationId);
  }
}
