import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertPostWithMoreInfo } from 'src/utils/convertPostWithMoreInfo';
import { DataSource, Repository } from 'typeorm';
import { FollowPostDTO } from '../dtos/followPost.dto';
import { PostPage } from '../dtos/postPage.dto';
import { PostWithMoreInfo } from '../dtos/PostWithMoreInfo.dto';
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

  async getAllPostFollowWithUserId(userId: string, page: PostPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostWithMoreInfo> =
      new PagedData<PostWithMoreInfo>();

    try {
      const listPostQuery = await this.createQueryBuilder('User_Follow_Post')
        .where('User_Follow_Post.userId = :userId', { userId: userId })
        .leftJoin('User_Follow_Post.post', 'Post')
        .leftJoin('Post.postComments', 'PostComment')
        .leftJoin('PostComment.postReplies', 'PostReply')
        .leftJoin('Post.owner', 'User')
        .leftJoin('Post.category', 'Category')
        .leftJoin('Post.tags', 'PostTag')
        .leftJoin('Post.postViews', 'PostView')
        .loadRelationCountAndMap('Post.views', 'Post.postViews')
        .loadRelationCountAndMap('Post.commentCount', 'Post.postComments')
        .loadRelationCountAndMap(
          'Post.replyCount',
          'Post.postComments.postReplies',
        )
        .orderBy('Post.dateModified', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'User_Follow_Post',
          'Post',
          'PostComment',
          'PostReply',
          'User',
          'Category',
          'PostTag',
        ])
        .getMany();

      const listPost = listPostQuery.map((data) => data.post);
      const listPostWithData = listPost.map((data) =>
        ConvertPostWithMoreInfo(data),
      );

      const totalPost = await this.count({ where: { userId: userId } });

      dataReturn.data = listPostWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
