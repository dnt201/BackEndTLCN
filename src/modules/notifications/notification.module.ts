import { UsersModule } from 'src/modules/users/users.module';
import { NotificationController } from './controllers/notification.controller';
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
    ConnectionModule,
    SettingModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationModule {}
