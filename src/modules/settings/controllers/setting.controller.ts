import { UpdateSettingDTO } from './../dtos/updateSetting.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SettingService } from '../services/setting.service';
import { Setting_Permission as ListPermission } from '../permission/setting.permission';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Setting } from '../entities/setting.entity';
import { CreateSettingDTO } from '../dtos/createSetting.dto';

@Controller('setting')
@UseInterceptors(ClassSerializerInterceptor)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @UseGuards(PermissionGuard(ListPermission.ViewAllSetting))
  async getAllSetting(): Promise<Setting[]> {
    return await this.settingService.getAllSetting();
  }

  @Get('detail')
  @UseGuards(PermissionGuard(ListPermission.ViewDetailSetting))
  async getDatailSetting(@Body() settingData: Setting) {
    const setting = await this.settingService.getSettingByKeyAndGroup(
      settingData.key,
      settingData.group,
    );
    if (!setting) {
      throw new NotFoundException(
        `Not found setting with key ${settingData.key} and group ${settingData.group}`,
      );
    }

    return setting;
  }

  @Post('create')
  @UseGuards(PermissionGuard(ListPermission.AddSetting))
  async createSetting(@Body() createSettingData: CreateSettingDTO) {
    const setting = await this.settingService.getSettingByKeyAndGroup(
      createSettingData.key,
      createSettingData.group,
    );
    if (setting) {
      throw new NotFoundException(
        `Already exist setting with key ${createSettingData.key} and group ${createSettingData.group}`,
      );
    }

    return await this.settingService.createSetting(createSettingData);
  }

  @Put('edit')
  @UseGuards(PermissionGuard(ListPermission.AddSetting))
  async updateSetting(@Body() createSettingData: UpdateSettingDTO) {
    const setting = await this.settingService.getSettingByKeyAndGroup(
      createSettingData.key,
      createSettingData.group,
    );
    if (!setting) {
      throw new NotFoundException(
        `Not found setting with key ${createSettingData.key} and group ${createSettingData.group}`,
      );
    }

    return await this.settingService.updateSetting(createSettingData);
  }
}
