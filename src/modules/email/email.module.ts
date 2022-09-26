import { Module } from '@nestjs/common';
import EmailService from './email.service';
import { SettingModule } from '../settings/setting.module';

@Module({
  imports: [SettingModule],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
