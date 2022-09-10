import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';

import { UsersService } from '../services/users.service';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get('/deleted')
  async getAllDeleteUsers() {
    return await this.usersService.getAllDeleteUsers();
  }

  @Get('/:id')
  async getUserById(@Param() { id }) {
    return await this.usersService.getUserById(id);
  }
}
