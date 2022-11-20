import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NotificationDTO } from '../dto/notification.dto';
import { Notification } from '../entity/notification.entity';

@Injectable()
export class NotificationRepository extends Repository<Notification> {
  constructor(private dataSource: DataSource) {
    super(Notification, dataSource.createEntityManager());
  }

  async createNewNotification(notificationDTO: NotificationDTO) {
    try {
      const notification = await this.create(notificationDTO);
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getNotification(notificationDTO: NotificationDTO) {
    try {
      return await this.findOne({
        where: {
          type: notificationDTO.type,
          refType: notificationDTO.refType,
          refId: notificationDTO.refId,
          userId: notificationDTO.userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeNotification(notificationDTO: NotificationDTO) {
    try {
      const notification = await this.getNotification(notificationDTO);
      await this.save({ ...notification, deleted: true });

      await this.softDelete(notification.id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
