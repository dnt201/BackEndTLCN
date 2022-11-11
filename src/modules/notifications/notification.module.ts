import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ConnectionModule } from '../connection/connection.module';
import { NotificationGateway } from './gateway/notification.gateway';
import { NotificationService } from './service/notification.service';

@Module({
  imports: [forwardRef(() => AuthModule), ConnectionModule],
  controllers: [],
  providers: [NotificationGateway, NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
