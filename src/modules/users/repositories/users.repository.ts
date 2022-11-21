import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertOrderQuery } from 'src/utils/convertOrderQuery';
import { DataSource, ILike, In, Like, Not, Repository } from 'typeorm';
import { CreateUserDTO } from '../dtos/createUser.dto';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import { UserPage } from '../dtos/userPage.dto';

import { User } from '../entities/user.entity';
import { RoleService } from '../services/roles.service';

@Injectable()
export class UserRepository extends Repository<User> {
  private userRoleDisplayName: string = this.configService.get('USER_ROLE');
  private adminRoleDisplayName: string = this.configService.get('ADMIN_ROLE');

  constructor(
    private dataSource: DataSource,
    private roleService: RoleService,
    private readonly configService: ConfigService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(createUserData: CreateUserDTO): Promise<User> {
    try {
      const userRole = await this.roleService.getRoleByDisplayName(
        this.userRoleDisplayName,
      );
      const adminRole = await this.roleService.getRoleByDisplayName(
        this.adminRoleDisplayName,
      );

      const newUser = {
        ...createUserData,
        username: createUserData.email,
        role: userRole,
      };
      if (createUserData.email === this.configService.get('ADMIN_EMAIL')) {
        newUser.role = adminRole;
        newUser.username = this.configService.get('ADMIN_USERNAME');
      }

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
      return await this.findOne({
        where: [{ email: email }],
        relations: ['role'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      return await this.findOne({ where: [{ id: id }], relations: ['role'] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUserByToken(token: string): Promise<User> {
    try {
      return await this.findOne({ where: [{ token: token }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllUser(page: UserPage) {
    const orderQuery =
      page?.order?.length === 0 ? {} : ConvertOrderQuery(page.order);

    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<User> = new PagedData<User>();

    try {
      const listUser = await this.find({
        order: orderQuery,
        take: takeQuery,
        skip: (skipQuery - 1) * takeQuery,
      });

      const totalUser = await this.count();

      dataReturn.data = listUser;
      dataReturn.page = new Page(
        takeQuery,
        skipQuery,
        totalUser,
        page?.order ?? [],
      );
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllUserForTag(existedIds: string[], matches: string) {
    try {
      const listUser = await this.find({
        where: [{ id: Not(In(existedIds)), username: Like(`%${matches}%`) }],
        take: 5,
      });

      return listUser.map((data) => {
        return {
          id: data.id,
          username: data.username,
          avatarLink: data.avatarId
            ? `http://localhost:3000/file/${data.avatarId}`
            : null,
        };
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUser(dataSearch: string) {
    try {
      const listUsers = await this.createQueryBuilder('User')
        .where('User.username ILIKE :username', { username: `%${dataSearch}%` })
        .leftJoinAndSelect('User.followers', 'UserFollow')
        .loadRelationCountAndMap('User.NumberOfFollowers', 'User.followers')
        .select('User')
        .take(10)
        .getMany();

      const listUser = listUsers.map((data) => {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          avatarLink: data.avatarId
            ? `http://localhost:3000/file/${data.avatarId}`
            : null,
        };
      });

      const countUser = await this.count({
        where: { username: ILike(`%${dataSearch}%`) },
      });

      return {
        data: listUser,
        count: countUser,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
