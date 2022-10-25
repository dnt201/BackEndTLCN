import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FollowPostDTO } from '../dtos/followPost.dto';
import { UserFollowPost } from '../entities/followPost.entity';

@Injectable()
export class FollowPostRepository extends Repository<UserFollowPost> {
  constructor(private dataSource: DataSource) {
    super(UserFollowPost, dataSource.createEntityManager());
  }

  async followPost(followData: FollowPostDTO) {
    try {
      const userFollowPost = await this.create(followData);
      return userFollowPost;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getFollowPostById(userId: string, postId: string) {
    try {
      return await this.findOne({
        where: [{ userId: userId, postId: postId }],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async unfollowPost(followData: FollowPostDTO) {
    try {
      const deletedResponse = await this.delete(followData);
      if (!deletedResponse.affected) {
        throw new BadRequestException(`Post Vote does not exist`);
      }
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }
}
