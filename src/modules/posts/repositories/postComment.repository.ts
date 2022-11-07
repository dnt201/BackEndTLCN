import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertCommentWithMoreInfo } from 'src/utils/convertCommentWithMoreInfo';
import { DataSource, Repository } from 'typeorm';
import { CommentPage } from '../dtos/commentPage.dto';
import { CommentWithMoreInfo } from '../dtos/commentWithMoreInfo.dto';
import { PostCommentDTO } from '../dtos/createComment.dto';
import { PostComment } from '../entities/postComment.entity';

@Injectable()
export class PostCommentRepository extends Repository<PostComment> {
  constructor(private dataSource: DataSource) {
    super(PostComment, dataSource.createEntityManager());
  }

  async createComment(commentData: PostCommentDTO) {
    try {
      const postComment = await this.create(commentData);
      return postComment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCommentById(id: string) {
    try {
      const postComment = await this.findOne({ where: [{ commentId: id }] });
      return postComment;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllCommentByPostId(postId: string, page: CommentPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<CommentWithMoreInfo> =
      new PagedData<CommentWithMoreInfo>();

    try {
      const listComment = await this.createQueryBuilder('PostComment')
        .where('PostComment.postId = :postId', { postId: postId })
        .leftJoin('PostComment.sender', 'Sender')
        .leftJoin('PostComment.postCommentTags', 'PostCommentTag')
        .leftJoin('PostCommentTag.sender', 'User_Tagged')
        .leftJoin('PostComment.postReplies', 'PostReply')
        .loadRelationCountAndMap(
          'PostComment.countReply',
          'PostComment.postReplies',
          'countReply',
        )

        .orderBy('PostComment.dateModified', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'PostComment',
          'Sender',
          'PostCommentTag',
          'User_Tagged',
          'PostReply',
        ])
        .getMany();

      const listPostWithData = listComment.map((data) =>
        ConvertCommentWithMoreInfo(data),
      );

      const totalPost = await this.count({ where: { postId: postId } });

      dataReturn.data = listPostWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }

    return false;
  }
}
