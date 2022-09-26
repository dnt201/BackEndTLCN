import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateSettingDTO } from '../dtos/createSetting.dto';
import { UpdateSettingDTO } from '../dtos/updateSetting.dto';
import { Setting } from '../entities/setting.entity';

@Injectable()
export class SettingRepository extends Repository<Setting> {
  constructor(private dataSource: DataSource) {
    super(Setting, dataSource.createEntityManager());
  }

  async createSetting(createSettingData: CreateSettingDTO) {
    try {
      return await this.create(createSettingData);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateSetting(updateSettingData: UpdateSettingDTO) {
    try {
      await this.update(
        { key: updateSettingData.key, group: updateSettingData.group },
        updateSettingData,
      );
      return await this.getSettingByKeyAndGroup(
        updateSettingData.key,
        updateSettingData.group,
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getSettingByKeyAndGroup(key: string, group: string) {
    try {
      return await this.findOne({ where: [{ key: key, group: group }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllSetting() {
    try {
      return await this.find({});
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
