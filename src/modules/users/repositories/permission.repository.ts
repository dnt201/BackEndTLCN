import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertOrderQuery } from 'src/utils/convertOrderQuery';
import { DataSource, Repository } from 'typeorm';

import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { PermissionPage } from '../dtos/permissionPage.dto';
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

  async getPermissionByData(permissionData: CreatePermissionDTO) {
    return await this.find({
      where: [
        { displayName: permissionData.displayName },
        { permission: permissionData.permission },
      ],
    });
  }

  async getAllPermissions(page: PermissionPage) {
    const orderQuery =
      page?.order?.length === 0 ? {} : ConvertOrderQuery(page.order);

    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<Permission> = new PagedData<Permission>();

    try {
      const listPermisison = await this.find({
        order: orderQuery,
        take: takeQuery,
        skip: (skipQuery - 1) * takeQuery,
      });

      const totalUser = await this.count();

      dataReturn.data = listPermisison;
      dataReturn.page = new Page(
        takeQuery,
        skipQuery,
        totalUser,
        page?.order ?? [],
      );
      return dataReturn;
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
