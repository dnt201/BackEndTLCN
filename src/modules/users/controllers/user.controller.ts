import { Permission } from './../entities/permission.entity';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// import { RoleGuard } from 'src/auth/guards/role.guard';

import { UsersService } from '../services/users.service';
import { User_Permission as ListPermission } from '../permission/permission';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { use } from 'passport';

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

  @Put('/admin/edit/:id')
  @UseGuards(PermissionGuard(ListPermission.UpdateUserInfo))
  async updateUserInfoWithAdminRole(
    @Param() { id },
    @Body() updateUserData: UpdateUserDTO,
  ) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException(`Not found user with id: ${id}`);
    return await this.usersService.updateUserInfoWithAdmin(id, updateUserData);
  }

  @Put('/edit')
  @UseGuards(JwtAuthenticationGuard)
  async updateUserInfo(@Req() request, @Body() userInfo: UpdateUserDTO) {
    const user = request.user;
    user.role = undefined;
    user.permission = undefined;
    return await this.usersService.updateUserInfo(user, userInfo);
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
