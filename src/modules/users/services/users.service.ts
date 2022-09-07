import { Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { UserRepository } from '../repositories/users.repository';
import { UpdateUserDTO } from '../dtos/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
