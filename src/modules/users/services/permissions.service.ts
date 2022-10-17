import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { PermissionPage } from '../dtos/permissionPage.dto';
import { UpdatePermissionDTO } from '../dtos/updatePermission.dto';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async createPermission(createPermissionData: CreatePermissionDTO) {
    const existedPermission =
      await this.permissionRepository.getPermissionByData(createPermissionData);

    if (existedPermission.length > 0) {
      if (existedPermission[0].permission === createPermissionData.permission)
        throw new BadRequestException(`Permission name existed. Try another`);
      else
        throw new BadRequestException(
          `Permission display name existed. Try another`,
        );
    }
    const newPermission = await this.permissionRepository.createPermission(
      createPermissionData,
    );
    await this.permissionRepository.save(newPermission);
    return newPermission;
  }

  async updatePermission(
    id: string,
    updatePermissionData: UpdatePermissionDTO,
  ) {
    const existedPermisison =
      await this.permissionRepository.getPermissionByData(updatePermissionData);

    if (existedPermisison.length > 0) {
      existedPermisison.forEach((permission) => {
        if (permission.id === id) {
        } else if (permission.permission === updatePermissionData.permission) {
          throw new BadRequestException(
            `Permission value existed. Try another`,
          );
        } else {
          throw new BadRequestException(
            `Permission display name existed. Try another`,
          );
        }
      });
    }

    return await this.permissionRepository.updatePermission(
      id,
      updatePermissionData,
    );
  }

  async deletePermission(id: string) {
    return await this.permissionRepository.deletePermission(id);
  }

  async getPermissionById(id: string) {
    return await this.permissionRepository.getPermissionById(id);
  }

  async getAllPermissions(page: PermissionPage) {
    return await this.permissionRepository.getAllPermissions(page);
  }

  async getPermissionByDisplayName(displayName: string) {
    return await this.permissionRepository.getPermisisonByDisplayName(
      displayName,
    );
  }

  async countRoleUsePermissions(id: string) {
    return await this.permissionRepository.countRoleUsePermission(id);
  }
}
