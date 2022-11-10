import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationGateway } from './gateway/notification.gateway';
import { NotificationService } from './service/notification.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [],
  providers: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
