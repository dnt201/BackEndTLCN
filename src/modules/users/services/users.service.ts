import { ForgotPasswordDTO } from './../dtos/forgotPassword.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { User } from '../entities/user.entity';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { UserRepository } from '../repositories/users.repository';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import { RoleService } from './roles.service';
import EmailService from 'src/modules/email/email.service';
import { UpdatePasswordDTO } from '../dtos/updatePassword.dto';
import { UserFollowRepository } from './../repositories/userFollow.repository';
import { FileDTO } from 'src/modules/files/dtos/file.dto';
import { FileService } from 'src/modules/files/services/file.service';
import { UserPage } from '../dtos/userPage.dto';
import { PostService } from 'src/modules/posts/services/post.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userFollowRepository: UserFollowRepository,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly roleService: RoleService,
    private readonly fileService: FileService,

    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
  ) {}

  async createUser(createUserData: CreateUserDTO): Promise<User> {
    const newUser = await this.userRepository.createUser(createUserData);
    const activateDate = await this.getActivateDate();
    const activateToken = await this.getActivateToken();
    await this.userRepository.save({
      ...newUser,
      token: activateToken,
      dateExpires: activateDate,
    });
    await this.emailService.sendMail({
      to: createUserData.email,
      subject: 'Activate Account',
      text: `Activate Account By TeachingMe with token ${activateToken}`,
    });
    return newUser;
  }

  async forgotPassword(email: string) {
    const user = await this.getUserByEmail(email);
    const forgotPasswordToken = await this.getActivateToken();
    const forgotDateExipre = await this.getActivateDate();
    await this.userRepository.save({
      ...user,
      forgotPasswordToken: forgotPasswordToken,
      dateForgotExpires: forgotDateExipre,
    });
    await this.emailService.sendMail({
      to: email,
      subject: 'Recovery Password Account',
      text: `Recovery Password Account TeachingMe with token ${forgotPasswordToken}`,
    });
    return true;
  }

  async validateForgotToken(token: string) {
    const user = await this.userRepository.validateForgotToken(token);
    if (!user) throw new NotFoundException(`Token does not exist`);
    else if (Date.now() - user.dateForgotExpires.getTime() > 0)
      throw new BadRequestException('Your token Over Time');
    return true;
  }

  async updateNewPassword(forgotPasswordData: ForgotPasswordDTO) {
    const TIME_EXPIRATION = 60 * 60 * 1000;
    const user = await this.userRepository.validateForgotToken(
      forgotPasswordData.token,
    );
    if (!user) throw new NotFoundException(`Token does not exist`);
    else if (Date.now() - user.dateForgotExpires.getTime() > TIME_EXPIRATION)
      throw new BadRequestException('Your token Over Time');
    else if (forgotPasswordData.password !== forgotPasswordData.confirmPassword)
      throw new BadRequestException('Confirm Password does not match');

    const hashedPassword = await bcrypt.hash(forgotPasswordData.password, 10);
    await this.userRepository.save({
      ...user,
      password: hashedPassword,
      forgotPasswordToken: null,
      dateForgotExpires: null,
    });
    return true;
  }

  async updateUserInfoWithAdmin(id: string, updateData: UpdateUserDTO) {
    if (updateData.email) {
      const userWithNewEmail = await this.getUserByEmail(updateData.email);
      if (userWithNewEmail && userWithNewEmail.id !== id) {
        throw new BadRequestException(
          `Mail ${updateData.email} is already in use. Try another mail`,
        );
      }
    }

    const userData = await this.userRepository.getUserById(id);
    const updateUser = await this.userRepository.updateUser(id, {
      ...userData,
      ...updateData,
    });
    return updateUser;
  }

  async updateUserInfo(userAccount: User, updateData: UpdateUserDTO) {
    const userWithNewEmail = await this.getUserByEmail(updateData.email);
    if (userWithNewEmail && userWithNewEmail.id !== userAccount.id) {
      throw new BadRequestException(
        `Mail ${updateData.email} is already in use. Try another mail`,
      );
    }

    const updateUser = await this.userRepository.updateUser(userAccount.id, {
      ...userAccount,
      ...updateData,
    });
    return updateUser;
  }

  async updatePassword(userId: string, updatePasswordData: UpdatePasswordDTO) {
    const userExist = await this.getUserById(userId);

    if (updatePasswordData.newPassword !== updatePasswordData.confirmPassword)
      throw new BadRequestException('Confirm Password does not match');

    await this.verifyPassword(
      updatePasswordData.oldPassword,
      userExist.password,
    );
    const hashedPassword = await bcrypt.hash(
      updatePasswordData.newPassword,
      10,
    );

    const user = {
      ...userExist,
      password: hashedPassword,
    };

    await this.userRepository.update(userId, user);
    return await this.getUserById(userId);
  }

  async activateAccount(token: string) {
    const TIME_EXPIRATION = 24 * 60 * 60 * 1000;

    const user = await this.getUserByToken(token);
    if (!user) throw new NotFoundException(`Not found user`);
    else if (Date.now() - user.dateExpires.getTime() > TIME_EXPIRATION)
      throw new BadRequestException('Your token Over Time');

    await this.userRepository.update(user.id, {
      ...user,
      token: null,
      dateExpires: null,
      isActive: true,
    });
    return this.getUserById(user.id);
  }

  async getAllUsers(page: UserPage, dataSearch: string) {
    const users = await this.userRepository.getAllUser(page, dataSearch);
    return users;
  }

  async getAllUserForTag(existedIds: string[], matches: string) {
    return await this.userRepository.getAllUserForTag(existedIds, matches);
  }

  async getAllDeleteUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: [{ deleted: true }],
      withDeleted: true,
    });
    return users;
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.getUserByEmail(email);
  }

  async getUserById(id: string): Promise<User> {
    return await this.userRepository.getUserById(id);
  }

  async getUserByIdWithMoreInfo(id: string) {
    const user = await this.userRepository.getUserById(id);
    const numberOfFolllow = await this.userFollowRepository.countMyFollower(id);
    const numberOfFolllowUser =
      await this.userFollowRepository.countMyFollowUser(id);
    return {
      ...user,
      follower: numberOfFolllow,
      following: numberOfFolllowUser,
    };
  }

  async getUserByIdWithLoginAccount(userViewId: string, myId: string) {
    const user = await this.getUserByIdWithMoreInfo(userViewId);

    const isFollow = await this.userFollowRepository.getFollowUserData(
      myId,
      userViewId,
    );

    return {
      ...user,
      isFollowing: isFollow ? true : false,
    };
  }

  async getUserFollowInfo(userId: string, myId: string) {
    return await this.userFollowRepository.getFollowUserData(myId, userId);
  }

  async getUserByToken(token: string): Promise<User> {
    return await this.userRepository.getUserByToken(token);
  }

  async getUserData(id: string) {
    const user = await this.userRepository.getUserById(id);
    const rolePermission = await this.roleService.getPermissionByRole(
      user?.role.id,
    );
    const listPermission = rolePermission.permission.map((permission) => {
      return permission.displayName;
    });
    return {
      ...user,
      password: undefined,
      permission: listPermission,
      role: user.role.displayName,
      currentHashedRefreshToken: undefined,
    };
  }

  async findUser(dataSearch: string) {
    return await this.userRepository.findUser(dataSearch);
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: string) {
    return this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getUserById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async userFollowUser(userId: string, userFollowId: string) {
    return await this.userFollowRepository.userFollow({ userId, userFollowId });
  }

  async userUnfollowUser(userId: string, userFollowId: string) {
    return await this.userFollowRepository.userUnfollow({
      userId,
      userFollowId,
    });
  }

  async getMyFollowUser(userId: string) {
    return await this.userFollowRepository.getMyFollowUser(userId);
  }

  async getMyFollower(userId: string) {
    return await this.userFollowRepository.getMyFollower(userId);
  }

  async addAvatar(userId: string, fileData: FileDTO) {
    const avatar = await this.fileService.saveLocalFileData(fileData);
    await this.userRepository.update(userId, {
      avatarId: avatar.id,
    });
    return `http://localhost:3000/file/${avatar.id}`;
  }

  private getActivateToken() {
    const activateToken = crypto.randomBytes(20).toString('hex');
    return crypto.createHash('sha256').update(activateToken).digest('hex');
  }

  private getActivateDate() {
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 1);
    return endTime;
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    const isMatchingPassword = await bcrypt.compare(password, hashedPassword);
    if (!isMatchingPassword) {
      throw new BadRequestException('Wrong password');
    }
  }
}
