import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationStatus } from 'src/common/constants/notificationStatus.dto';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { DataSource, Repository } from 'typeorm';
import { NotificationDTO } from '../dto/notification.dto';
import { NotificationPage } from '../dto/notificationPage.dto';
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

  async getNotifications(userId: string, page: NotificationPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<Notification> = new PagedData<Notification>();

    try {
      const notificationList = await this.find({
        where: { userId: userId },
        order: { dateCreated: 'DESC' },
        take: takeQuery,
        skip: (skipQuery - 1) * takeQuery,
      });

      const totalNotification = await this.count({ where: { userId: userId } });
      dataReturn.data = notificationList;
      dataReturn.page = new Page(takeQuery, skipQuery, totalNotification, []);

      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findNotificationById(notificationId: string) {
    try {
      return await this.findOne({ where: { id: notificationId } });
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

  async receiveNotification(notificationId: string) {
    try {
      await this.update(notificationId, {
        status: NotificationStatus.Received,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async clickNotification(notificationId: string) {
    try {
      await this.update(notificationId, {
        isClicked: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
