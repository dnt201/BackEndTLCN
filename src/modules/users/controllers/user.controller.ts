import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  PayloadTooLargeException,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
// import { RoleGuard } from 'src/auth/guards/role.guard';

import { UsersService } from '../services/users.service';
import { User_Permission as ListPermission } from '../permission/permission';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { UpdatePasswordDTO } from '../dtos/updatePassword.dto';
import { UserFollowUserDTO } from '../dtos/userFollowUser.dto';
import { FilesInterceptor } from 'src/modules/files/interceptors/file.interceptor';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';

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

  @UseGuards(JwtAuthenticationGuard)
  @Post('/update/password')
  async updatePassword(
    @Req() request,
    @Body() updatePassword: UpdatePasswordDTO,
  ) {
    const userId = request.user.id;
    return await this.usersService.updatePassword(userId, updatePassword);
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

  @Post('follow')
  @UseGuards(JwtAuthenticationGuard)
  async userFollow(@Req() request, @Body() data: UserFollowUserDTO) {
    const userFollow = await this.usersService.getUserById(data.userFollowId);
    if (!userFollow)
      throw new NotFoundException(
        `Not found user with id ${data.userFollowId}`,
      );

    return await this.usersService.userFollowUser(
      request.user.id,
      data.userFollowId,
    );
  }

  @Post('unfollow')
  @UseGuards(JwtAuthenticationGuard)
  async userUnfollow(@Req() request, @Body() data: UserFollowUserDTO) {
    const userFollow = await this.usersService.getUserById(data.userFollowId);
    if (!userFollow)
      throw new NotFoundException(
        `Not found user with id ${data.userFollowId}`,
      );

    return await this.usersService.userUnfollowUser(
      request.user.id,
      data.userFollowId,
    );
  }

  @Get('/my/follow')
  @UseGuards(JwtAuthenticationGuard)
  async getMyFollowUser(@Req() request) {
    return await this.usersService.getMyFollowUser(request.user.id);
  }

  @Get('/my/follower')
  @UseGuards(JwtAuthenticationGuard)
  async getMyFollower(@Req() request) {
    return await this.usersService.getMyFollower(request.user.id);
  }

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/avatars',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async addAvatar(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.addAvatar(request.user.id, {
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
  }
}
