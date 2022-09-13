import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { UpdatePermissionDTO } from '../dtos/updatePermission.dto';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionRepository extends Repository<Permission> {
  constructor(private dataSource: DataSource) {
    super(Permission, dataSource.createEntityManager());
  }

  async createPermission(createPermissionData: CreatePermissionDTO) {
    try {
      return await this.create(createPermissionData);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePermission(
    id: string,
    updatePermissionData: UpdatePermissionDTO,
  ) {
    try {
      await this.update(id, updatePermissionData);
      return await this.getPermissionById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deletePermission(id: string) {
    try {
      const deletedResponse = await this.delete(id);
      if (!deletedResponse.affected) {
        throw new NotFoundException(`Permission with id: ${id} does not exist`);
      }
      return true;
    } catch (error) {
      if (error.code === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }

  async getPermissionById(id: string) {
    try {
      return await this.findOne({ where: [{ id: id }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPermisisonByDisplayName(displayName: string) {
    try {
      return await this.findOne({ where: [{ displayName: displayName }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPermissions() {
    try {
      return await this.find({});
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async countRoleUsePermission(id: string) {
    try {
      const permission = await this.findOne({
        where: [{ id: id }],
        relations: ['rolePermission'],
      });
      return permission ? permission.rolePermission.length : 0;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
