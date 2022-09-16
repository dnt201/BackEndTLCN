import { UpdateRoleDTO } from './../dtos/updateRole.dto';
import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  ClassSerializerInterceptor,
  Controller,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { CreateRoleDTO } from '../dtos/createRole.dto';
import { Role } from '../entities/role.entity';
import { RoleService } from '../services/roles.service';
import { CreateRolePermissionDTO } from '../dtos/createRolePermission.dto';
import { DeleteRolePermissionDTO } from '../dtos/deleteRolePermission.dto';
// import { RoleGuard } from 'src/auth/guards/role.guard';
import { ConfigService } from '@nestjs/config';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { Role_Permission as ListPermission } from '../permission/permission';

@Controller('admin/roles')
@UseInterceptors(ClassSerializerInterceptor)
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.ViewRole))
  async getAllRoles(): Promise<Role[]> {
    return await this.roleService.getAllRoles();
  }

  @Post('create')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.AddRole))
  async createNewRole(@Body() roleData: CreateRoleDTO): Promise<Role> {
    const newRole = await this.roleService.createRole(roleData);
    return newRole;
  }

  @Put('edit/:id')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.EditRole))
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
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.DeleteRole))
  async deleteRole(@Param() { id }) {
    const existedRole = await this.roleService.getRoleById(id);
    if (!existedRole)
      throw new NotFoundException(`Not found role with id: ${id}`);
    return await this.roleService.deleteRole(id);
  }

  @Post('role-permission/create')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.AddPermissionToRole))
  async createRolePermission(
    @Body() createRolePermissionData: CreateRolePermissionDTO,
  ) {
    return await this.roleService.addPermissionToRole(
      createRolePermissionData.roleId,
      createRolePermissionData.permissionId,
    );
  }

  @Delete('role-permission/delete')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.DeletePermissionOfRole))
  async deleteRolePermission(
    @Body() deleteRolePermissionData: DeleteRolePermissionDTO,
  ) {
    return await this.roleService.deletePermissionOfRole(
      deleteRolePermissionData.roleId,
      deleteRolePermissionData.permissionId,
    );
  }
}
