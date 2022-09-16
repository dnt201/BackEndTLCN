import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { UpdatePermissionDTO } from '../dtos/updatePermission.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionService } from '../services/permissions.service';
import { Permission_Permission as ListPermission } from '../permission/permission';
import { PermissionGuard } from 'src/auth/guards/permission.guard';

@Controller('admin/permissions')
@UseInterceptors(ClassSerializerInterceptor)
export class PermissionsController {
  // AdminRole: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly permissionService: PermissionService,
  ) {
    // this.AdminRole = this.configService.get('ADMIN_ROLE');
  }

  @Get()
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.ViewPermission))
  async getAllPermission(): Promise<Permission[]> {
    return await this.permissionService.getAllPermissions();
  }

  @Post('create')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.AddPermission))
  async createPermission(
    @Body() createPermissionData: CreatePermissionDTO,
  ): Promise<Permission> {
    return await this.permissionService.createPermission(createPermissionData);
  }

  @Put('edit/:id')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.EditPermission))
  async updatePermission(
    @Param() { id },
    @Body() updatePermissionData: UpdatePermissionDTO,
  ) {
    const existedPermission = await this.permissionService.getPermissionById(
      id,
    );

    if (!existedPermission)
      throw new NotFoundException(`Not found permission with id ${id}`);

    return await this.permissionService.updatePermission(
      id,
      updatePermissionData,
    );
  }

  @Delete('delete/:id')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.DeletePermission))
  async deletePermission(@Param() { id }) {
    const existedPermission = await this.permissionService.getPermissionById(
      id,
    );

    if (!existedPermission)
      throw new NotFoundException(`Not found permission with id ${id}`);

    return await this.permissionService.deletePermission(id);
  }
}
