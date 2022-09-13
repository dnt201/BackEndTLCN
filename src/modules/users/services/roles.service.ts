import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { CreateRoleDTO } from '../dtos/createRole.dto';
import { UpdateRoleDTO } from '../dtos/updateRole.dto';
import { RolePermissionRepository } from '../repositories/rolePermission.repository';
import { RoleRepository } from '../repositories/roles.repositoty';
import { PermissionService } from './permissions.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionService: PermissionService,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async createRole(createRoleData: CreateRoleDTO) {
    const existedRole = await this.roleRepository.find({
      where: [
        { displayName: createRoleData.displayName },
        { role: createRoleData.role },
      ],
    });

    if (existedRole.length > 0) {
      if (existedRole[0].role === createRoleData.role)
        throw new BadRequestException(`Role value existed. Try another`);
      else
        throw new BadRequestException(`Role display name existed. Try another`);
    }

    const newRole = await this.roleRepository.createRole(createRoleData);
    await this.roleRepository.save(newRole);
    return newRole;
  }

  async updateRole(id: string, updateRoleData: UpdateRoleDTO) {
    const updatedRole = await this.roleRepository.updateRole(
      id,
      updateRoleData,
    );
    return updatedRole;
  }

  async deleteRole(id: string) {
    const userCount = await this.roleRepository.countUserByRole(id);
    if (userCount === 0) return await this.roleRepository.deleteRole(id);
    else {
      throw new BadRequestException('Can not delete this role');
    }
  }

  async getAllRoles() {
    return this.roleRepository.getAllRole();
  }

  async getRoleById(id: string) {
    return await this.roleRepository.getRoleById(id);
  }

  async getRoleByDisplayName(displayName: string) {
    return await this.roleRepository.getRoleByDisplayName(displayName);
  }

  async getPermissionByRole(id: string) {
    return await this.roleRepository.getPermissionByRole(id);
  }

  async addPermissionToRole(id: string, permissionId: string) {
    try {
      const role = await this.getPermissionByRole(id);
      const listPermission = role.permission.map((permission) => {
        return permission.id;
      });
      if (listPermission.indexOf(permissionId) !== -1)
        throw new InternalServerErrorException(
          'This permission has already been added to this role',
        );

      await this.rolePermissionRepository.createRolePermission({
        roleId: id,
        permissionId: permissionId,
      });

      return await this.getPermissionByRole(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deletePermissionOfRole(roleId: string, permissionId: string) {
    const roleWithPermission = await this.getPermissionByRole(roleId);
    const permission = roleWithPermission.permission.map((permission) => {
      return permission.id;
    });
    if (permission.indexOf(permissionId) === -1)
      throw new BadRequestException(
        `Permission does not in ${roleWithPermission.displayName} role`,
      );

    return await this.rolePermissionRepository.deleteRolePermission({
      roleId: roleId,
      permissionId: permissionId,
    });
  }
}
