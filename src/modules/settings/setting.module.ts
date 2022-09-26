import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Setting } from './entities/setting.entity';
import { SettingService } from './services/setting.service';
import { SettingController } from './controllers/setting.controller';
import { SettingRepository } from './repositories/setting.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingService, SettingRepository],
  controllers: [SettingController],
  exports: [SettingService],
})
export class SettingModule {}
