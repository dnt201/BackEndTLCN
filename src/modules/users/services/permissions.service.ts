import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { UpdatePermissionDTO } from '../dtos/updatePermission.dto';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async createPermission(createPermissionData: CreatePermissionDTO) {
    const existedPermission = await this.permissionRepository.find({
      where: [
        { displayName: createPermissionData.displayName },
        { permission: createPermissionData.permission },
      ],
    });

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
    return await this.permissionRepository.updatePermission(
      id,
      updatePermissionData,
    );
  }

  async deletePermission(id: string) {
    // const roleUsePermission =
    //   await this.permissionRepository.countRoleUsePermission(id);
    // if (roleUsePermission > 0)
    //   throw new BadRequestException(`Cannot delete permission with id: ${id}`);
    // else
    return await this.permissionRepository.deletePermission(id);
  }

  async getPermissionById(id: string) {
    return await this.permissionRepository.getPermissionById(id);
  }

  async getAllPermissions() {
    return await this.permissionRepository.getAllPermissions();
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
