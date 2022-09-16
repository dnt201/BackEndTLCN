import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// import { RoleGuard } from 'src/auth/guards/role.guard';

import { UsersService } from '../services/users.service';
import { User_Permission as ListPermission } from '../permission/permission';
import { PermissionGuard } from 'src/auth/guards/permission.guard';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.ViewAllUser))
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('/deleted')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.ViewAllDeleteUser))
  async getAllDeleteUsers() {
    return await this.usersService.getAllDeleteUsers();
  }

  @Get('/:id')
  async getUserById(@Param() { id }) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException(`Not found user with id: ${id}`);
    return user;
  }
}
