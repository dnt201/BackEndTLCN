import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertPostWithMoreInfo } from 'src/utils/convertPostWithMoreInfo';
import { DataSource, Repository } from 'typeorm';
import { PostPage } from '../dtos/postPage.dto';
import { PostWithMoreInfo } from '../dtos/PostWithMoreInfo.dto';
import { ViewPostDTO } from '../dtos/viewPost.dto';
import { PostView } from '../entities/postView.entity';

@Injectable()
export class PostViewRepository extends Repository<PostView> {
  constructor(private dataSource: DataSource) {
    super(PostView, dataSource.createEntityManager());
  }

  async viewPost(viewPostData: ViewPostDTO) {
    try {
      const postView = await this.create(viewPostData);
      return postView;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostViewById(viewPostData: ViewPostDTO) {
    try {
      if (viewPostData.userId === undefined) return null;

      return await this.findOne({
        where: [{ userId: viewPostData.userId, postId: viewPostData.postId }],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPostViewWithUserId(userId: string, page: PostPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostWithMoreInfo> =
      new PagedData<PostWithMoreInfo>();

    try {
      const listPostQuery = await this.createQueryBuilder('Post_View')
        .where('Post_View.userId = :userId', { userId: userId })
        .leftJoin('Post_View.post', 'Post')
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
        .orderBy('Post_View.dateModified', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'Post_View',
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
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
