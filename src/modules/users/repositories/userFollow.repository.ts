import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateUserFollowDTO } from '../dtos/createUserFollow.dto';
import { UserFollow } from '../entities/userFollow.entity';

@Injectable()
export class UserFollowRepository extends Repository<UserFollow> {
  constructor(private dataSource: DataSource) {
    super(UserFollow, dataSource.createEntityManager());
  }

  async userFollow(userFollowData: CreateUserFollowDTO) {
    try {
      const userFollow = await this.create(userFollowData);
      await this.save(userFollow);
      return userFollow;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async userUnfollow(userUnfollowData: CreateUserFollowDTO) {
    try {
      const deletedResponse = await this.delete(userUnfollowData);
      if (!deletedResponse.affected) {
        throw new BadRequestException(`User does not exist`);
      }
      return true;
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }

  async getMyFollowUser(id: string) {
    try {
      const usersFollow = await this.find({
        where: [{ userId: id }],
        relations: ['userFollow'],
      });
      return usersFollow.map((user) => {
        return user.userFollow;
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMyFollower(id: string) {
    try {
      const usersFollow = await this.find({
        where: [{ userFollowId: id }],
        relations: ['follower'],
      });
      return usersFollow.map((user) => {
        return user.follower;
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
