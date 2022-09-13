import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { UserRepository } from '../repositories/users.repository';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import { RoleService } from './roles.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
  ) {}

  async createUser(createUserData: CreateUserDTO): Promise<User> {
    const newUser = await this.userRepository.createUser(createUserData);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async updateUser(id: string, updateUserData: UpdateUserDTO): Promise<User> {
    const updateUser = await this.userRepository.updateUser(id, updateUserData);
    return updateUser;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find({ take: 20 });
    return users;
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
}
