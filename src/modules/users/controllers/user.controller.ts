import {
  Headers,
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
  UnauthorizedException,
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
import { getUserWithImageLink } from 'src/utils/getImageLinkUrl';
import { UserPage } from '../dtos/userPage.dto';
import { ReturnResult } from 'src/common/dto/ReturnResult';
import { PagedData } from 'src/common/dto/PageData';
import { User } from '../entities/user.entity';
import { getTypeHeader } from 'src/utils/getTypeHeader';
import { HeaderNotification } from 'src/common/constants/HeaderNotification.constant';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.ViewAllUser))
  async getAllUsers(@Body() page: UserPage) {
    const dataReturn: ReturnResult<PagedData<User>> = new ReturnResult<
      PagedData<User>
    >();

    const listUser = await this.usersService.getAllUsers(page);
    listUser.data = listUser.data.map((user) => {
      return getUserWithImageLink(user);
    });

    dataReturn.result = listUser;
    dataReturn.message = null;

    return dataReturn;
  }

  @Put('/admin/edit/:id')
  @UseGuards(PermissionGuard(ListPermission.UpdateUserInfo))
  async updateUserInfoWithAdminRole(
    @Param() { id },
    @Body() updateUserData: UpdateUserDTO,
  ) {
    const user = await this.usersService.getUserById(id);
    if (!user) throw new NotFoundException(`Not found user with id: ${id}`);
    const userData = await this.usersService.updateUserInfoWithAdmin(
      id,
      updateUserData,
    );
    return getUserWithImageLink(userData);
  }

  @Put('/edit')
  @UseGuards(JwtAuthenticationGuard)
  async updateUserInfo(@Req() request, @Body() userInfo: UpdateUserDTO) {
    const user = request.user;
    user.role = undefined;
    user.permission = undefined;
    const userData = await this.usersService.updateUserInfo(user, userInfo);
    return getUserWithImageLink(userData);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('/update/password')
  async updatePassword(
    @Req() request,
    @Body() updatePassword: UpdatePasswordDTO,
  ) {
    const userId = request.user.id;
    const userData = await this.usersService.updatePassword(
      userId,
      updatePassword,
    );
    return getUserWithImageLink(userData);
  }

  @Get('/deleted')
  // @UseGuards(RoleGuard(process.env.ADMIN_ROLE))
  @UseGuards(PermissionGuard(ListPermission.ViewAllDeleteUser))
  async getAllDeleteUsers() {
    return await this.usersService.getAllDeleteUsers();
  }

  @Get('/:id')
  async getUserById(@Headers() headers, @Param() { id }) {
    const data = getTypeHeader(headers);

    if (data.message === HeaderNotification.WRONG_AUTHORIZATION) {
      throw new UnauthorizedException();
    } else if (data.message === HeaderNotification.NOT_FOUND_AUTHORIZATION) {
      const user = await this.usersService.getUserByIdWithMoreInfo(id);
      if (!user?.id)
        throw new NotFoundException(`Not found user with id: ${id}`);
      return getUserWithImageLink(user);
    } else if (data.message === HeaderNotification.TRUE_AUTHORIZATION) {
      const me = String(data.result);
      const user = await this.usersService.getUserByIdWithLoginAccount(id, me);
      if (!user?.id)
        throw new NotFoundException(`Not found user with id: ${id}`);
      return getUserWithImageLink(user);
    }

    const user = await this.usersService.getUserByIdWithMoreInfo(id);
    if (!user?.id) throw new NotFoundException(`Not found user with id: ${id}`);
    return getUserWithImageLink(user);
    return user;
  }

  // @Get('/info/:id')
  // @UseGuards(JwtAuthenticationGuard)
  // async getUserByIdWithLogin(@Req() request: RequestWithUser, @Param() { id }) {
  //   const me = request.user.id;
  //   const user = await this.usersService.getUserByIdWithLoginAccount(id, me);
  //   if (!user?.id) throw new NotFoundException(`Not found user with id: ${id}`);
  //   return getUserWithImageLink(user);
  //   return user;
  // }

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
    const listUser = await this.usersService.getMyFollowUser(request.user.id);
    return listUser.map((user) => {
      return getUserWithImageLink(user);
    });
  }

  @Get('/my/follower')
  @UseGuards(JwtAuthenticationGuard)
  async getMyFollower(@Req() request) {
    const listUser = await this.usersService.getMyFollower(request.user.id);
    return listUser.map((user) => {
      return getUserWithImageLink(user);
    });
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
