import { UpdateRoleDTO } from './../dtos/updateRole.dto';
import {
  ClassSerializerInterceptor,
  Controller,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common/decorators';
import { CreateRoleDTO } from '../dtos/createRole.dto';
import { Role } from '../entities/role.entity';
import { RoleService } from '../services/roles.service';
import { CreateRolePermissionDTO } from '../dtos/createRolePermission.dto';
import { DeleteRolePermissionDTO } from '../dtos/deleteRolePermission.dto';

@Controller('admin/roles')
@UseInterceptors(ClassSerializerInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async getAllRoles(): Promise<Role[]> {
    return await this.roleService.getAllRoles();
  }

  @Post('create')
  async createNewRole(@Body() roleData: CreateRoleDTO): Promise<Role> {
    const newRole = await this.roleService.createRole(roleData);
    return newRole;
  }

  @Put('edit/:id')
  async editRole(
    @Param() { id },
    @Body() roleData: UpdateRoleDTO,
  ): Promise<Role> {
    const existedRole = await this.roleService.getRoleById(id);
    if (!existedRole)
      throw new NotFoundException(`Not found role with id: ${id}`);
    return await this.roleService.updateRole(id, roleData);
  }

  @Delete('delete/:id')
  async deleteRole(@Param() { id }) {
    const existedRole = await this.roleService.getRoleById(id);
    if (!existedRole)
      throw new NotFoundException(`Not found role with id: ${id}`);
    return await this.roleService.deleteRole(id);
  }

  @Post('role-permission/create')
  async createRolePermission(
    @Body() createRolePermissionData: CreateRolePermissionDTO,
  ) {
    return await this.roleService.addPermissionToRole(
      createRolePermissionData.roleId,
      createRolePermissionData.permissionId,
    );
  }

  @Delete('role-permission/delete')
  async deleteRolePermission(
    @Body() deleteRolePermissionData: DeleteRolePermissionDTO,
  ) {
    return await this.roleService.deletePermissionOfRole(
      deleteRolePermissionData.roleId,
      deleteRolePermissionData.permissionId,
    );
  }
}
