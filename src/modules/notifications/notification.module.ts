import { NotificationRepository } from './repository/notification.repository';
import { SettingModule } from './../settings/setting.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionModule } from '../connection/connection.module';
import { NotificationGateway } from './gateway/notification.gateway';
import { NotificationService } from './service/notification.service';
import { Notification } from './entity/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    forwardRef(() => AuthModule),
    ConnectionModule,
    SettingModule,
  ],
  controllers: [],
  providers: [NotificationGateway, NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
