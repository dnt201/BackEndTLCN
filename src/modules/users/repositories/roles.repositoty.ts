import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateRoleDTO } from '../dtos/createRole.dto';
import { UpdateRoleDTO } from '../dtos/updateRole.dto';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }

  async createRole(createRoleData: CreateRoleDTO) {
    try {
      const role = await this.create(createRoleData);
      return role;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateRole(id: string, updateRoleData: UpdateRoleDTO) {
    try {
      const existedRole = this.getRoleById(id);
      await this.update(id, { ...existedRole, ...updateRoleData });
      return await this.getRoleById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteRole(id: string) {
    try {
      const deletedResponse = await this.delete(id);
      if (!deletedResponse.affected) {
        throw new NotFoundException(`Role with id: ${id} does not exist`);
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRoleById(id: string): Promise<Role> {
    try {
      return await this.findOne({ where: [{ id: id }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRoleByDisplayName(displayName: string): Promise<Role> {
    try {
      return await this.findOne({
        where: [{ displayName: displayName }],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllRole(): Promise<Role[]> {
    try {
      return await this.find({});
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getRoleByData(roleData: CreateRoleDTO) {
    return await this.find({
      where: [{ displayName: roleData.displayName }, { role: roleData.role }],
    });
  }

  async countUserByRole(id: string) {
    try {
      const role = await this.findOne({
        where: [{ id: id }],
        relations: ['user'],
      });
      return role.user.length;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPermissionByRole(id: string) {
    try {
      const role = await this.findOne({
        where: [{ id: id }],
        relations: ['rolePermission', 'rolePermission.permission'],
      });
      const listPermission = role.rolePermission.map((rolePermission) => {
        return rolePermission.permission;
      });
      const roleReturn = {
        ...role,
        rolePermission: undefined,
        permission: listPermission,
      };
      return roleReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
