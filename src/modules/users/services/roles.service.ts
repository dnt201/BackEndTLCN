import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateRoleDTO } from '../dtos/createRole.dto';
import { UpdateRoleDTO } from '../dtos/updateRole.dto';
import { RoleRepository } from '../repositories/roles.repositoty';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async createRole(createRoleData: CreateRoleDTO) {
    const existedRole = await this.getRoleByDisplayName(
      createRoleData.displayName,
    );
    if (existedRole) {
      throw new BadRequestException(
        `Role existed. Try another role display name`,
      );
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
    else if (userCount === -1) {
      throw new NotFoundException(`Not found role with id: ${id}`);
    } else {
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
}
