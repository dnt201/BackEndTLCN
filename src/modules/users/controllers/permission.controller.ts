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
  UseInterceptors,
} from '@nestjs/common';
import { CreatePermissionDTO } from '../dtos/createPermission.dto';
import { UpdatePermissionDTO } from '../dtos/updatePermission.dto';
import { Permission } from '../entities/permission.entity';
import { PermissionService } from '../services/permissions.service';

@Controller('admin/permissions')
@UseInterceptors(ClassSerializerInterceptor)
export class PermissionsController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async getAllPermission(): Promise<Permission[]> {
    return await this.permissionService.getAllPermissions();
  }

  @Post('create')
  async createPermission(
    @Body() createPermissionData: CreatePermissionDTO,
  ): Promise<Permission> {
    return await this.permissionService.createPermission(createPermissionData);
  }

  @Put('edit/:id')
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
  async deletePermission(@Param() { id }) {
    const existedPermission = await this.permissionService.getPermissionById(
      id,
    );

    if (!existedPermission)
      throw new NotFoundException(`Not found permission with id ${id}`);

    return await this.permissionService.deletePermission(id);
  }
}
