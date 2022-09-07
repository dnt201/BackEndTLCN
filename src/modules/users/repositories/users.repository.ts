import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { UpdateUserDTO } from '../dtos/updateUser.dto';

import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    private dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(createUserData: CreateUserDTO): Promise<User> {
    try {
      const newUser = { ...createUserData, username: createUserData.email };
      const user = await this.create(newUser);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateUser(id: string, updateUserData: UpdateUserDTO): Promise<User> {
    try {
      const existedUser = this.getUserById(id);
      const updatedUser = {
        ...existedUser,
        ...updateUserData,
      };
      await this.update(id, updatedUser);
      return this.getUserById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const existedUser = this.getUserById(id);
      await this.save({ ...existedUser, deleted: true });

      const deletedResponse = await this.softDelete(id);
      if (!deletedResponse.affected) {
        throw new NotFoundException(`User with id: ${id} does not exist`);
      }

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async restoreUser(id: string): Promise<User> {
    try {
      const restoreResponse = await this.restore(id);
      if (!restoreResponse.affected) {
        throw new NotFoundException(`User with id: ${id} does not exist`);
      }

      const user = await this.getUserById(id);
      const restoredUser = { ...user, deleted: false };
      return restoredUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    try {
      return await this.findOne({ where: [{ email: email }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      return await this.findOne({ where: [{ id: id }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
