import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';
import { DataSource, Repository } from 'typeorm';
import { CreateRolePermissionDTO } from '../dtos/createRolePermission.dto';
import { DeleteRolePermissionDTO } from '../dtos/deleteRolePermission.dto';
import { RolePermission } from '../entities/role_permission.entity';

@Injectable()
export class RolePermissionRepository extends Repository<RolePermission> {
  constructor(private dataSource: DataSource) {
    super(RolePermission, dataSource.createEntityManager());
  }

  async createRolePermission(
    createRolePermissionData: CreateRolePermissionDTO,
  ) {
    try {
      const rolePerm = await this.create(createRolePermissionData);
      await this.save(rolePerm);
      return rolePerm;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteRolePermission(
    deleteRolePermissionData: DeleteRolePermissionDTO,
  ) {
    try {
      const deletedResponse = await this.delete(deleteRolePermissionData);
      if (!deletedResponse.affected) {
        throw new BadRequestException(`Role permission does not exist`);
      }
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }
}
