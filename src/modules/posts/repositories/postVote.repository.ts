import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertPostWithMoreInfo } from 'src/utils/convertPostWithMoreInfo';
import { DataSource, Repository } from 'typeorm';
import { PostPage } from '../dtos/postPage.dto';
import { PostWithMoreInfo } from '../dtos/PostWithMoreInfo.dto';
import { VotePostDTO } from '../dtos/votePost.dto';
import { PostVote } from '../entities/postVote.entity';

@Injectable()
export class PostVoteRepository extends Repository<PostVote> {
  constructor(private dataSource: DataSource) {
    super(PostVote, dataSource.createEntityManager());
  }

  async votePost(votePostData: VotePostDTO) {
    try {
      const postVote = await this.create(votePostData);
      return postVote;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getVotePostById(userId: string, postId: string) {
    try {
      if (!userId) return null;
      return await this.findOne({
        where: [{ userId: userId, postId: postId }],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateVotePost(votePostData: VotePostDTO) {
    try {
      const vote = await this.getVotePostById(
        votePostData.userId,
        votePostData.postId,
      );
      await this.save({ ...vote, type: votePostData.type });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteVote(userId: string, postId: string) {
    try {
      const deletedResponse = await this.delete({
        userId: userId,
        postId: postId,
      });
      if (!deletedResponse.affected) {
        throw new BadRequestException(`Post Vote does not exist`);
      }
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPostVoteWithUserId(userId: string, page: PostPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostWithMoreInfo> =
      new PagedData<PostWithMoreInfo>();

    try {
      const listPostQuery = await this.createQueryBuilder('post_Vote')
        .where('post_Vote.userId = :userId', { userId: userId })
        .leftJoin('post_Vote.post', 'Post')
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
        .orderBy('post_Vote.dateModified', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'post_Vote',
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

      const totalPost = await this.count();

      dataReturn.data = listPostWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
