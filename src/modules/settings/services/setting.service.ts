import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSettingDTO } from '../dtos/createSetting.dto';
import { UpdateSettingDTO } from '../dtos/updateSetting.dto';
import { SettingRepository } from '../repositories/setting.repository';

@Injectable()
export class SettingService {
  constructor(private readonly settingRepository: SettingRepository) {}

  async createSetting(createSettingData: CreateSettingDTO) {
    const setting = await this.getSettingByKeyAndGroup(
      createSettingData.key,
      createSettingData.group,
    );
    if (setting) {
      throw new BadRequestException(
        `Already exist setting with group ${createSettingData.group} and key ${createSettingData.key}`,
      );
    }

    const settingData = await this.settingRepository.createSetting(
      createSettingData,
    );
    await this.settingRepository.save(settingData);
    return settingData;
  }

  async updateSetting(updateSettingData: UpdateSettingDTO) {
    const setting = await this.getSettingByKeyAndGroup(
      updateSettingData.key,
      updateSettingData.group,
    );
    if (!setting) {
      throw new NotFoundException(
        `Not found setting with group ${updateSettingData.group} and key ${updateSettingData.key}`,
      );
    }

    return this.settingRepository.updateSetting(updateSettingData);
  }

  async getSettingByKeyAndGroup(key: string, group: string) {
    return await this.settingRepository.getSettingByKeyAndGroup(key, group);
  }

  async getSettingValueByKeyAndGroup(key: string, group: string) {
    const setting = await this.settingRepository.getSettingByKeyAndGroup(
      key,
      group,
    );
    return setting?.value;
  }

  async getAllSetting() {
    return this.settingRepository.getAllSetting();
  }
}
