import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { NotificationPage } from '../dto/notificationPage.dto';
import { NotificationService } from '../service/notification.service';

@Controller('notification')
@UseInterceptors(ClassSerializerInterceptor)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async getNotifications(
    @Req() request: RequestWithUser,
    @Body() page: NotificationPage,
  ) {
    const userId = request.user.id;
    return await this.notificationService.getNotifications(userId, page);
  }
}
