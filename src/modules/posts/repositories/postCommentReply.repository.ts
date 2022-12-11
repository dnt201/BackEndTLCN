import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertReplyWithMoreInfo } from 'src/utils/convertReplyWithMoreInfo';
import { DataSource, Repository } from 'typeorm';
import { ReplyWithMoreInfo } from '../dtos/commentWithMoreInfo.dto';
import { PostReplyDTO } from '../dtos/createReply.dto';
import { ReplyPage } from '../dtos/replyPage.dto';
import { PostReply } from '../entities/postReply.entity';

@Injectable()
export class PostReplyRepository extends Repository<PostReply> {
  constructor(private dataSource: DataSource) {
    super(PostReply, dataSource.createEntityManager());
  }

  async createReply(replyData: PostReplyDTO) {
    try {
      const postReply = await this.create(replyData);
      return postReply;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateReply(id: string, updatePostTagData: PostReplyDTO) {
    try {
      await this.update(id, updatePostTagData);
      return await this.getReplyById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteReply(id: string) {
    try {
      const deletedResponse = await this.delete(id);
      if (!deletedResponse.affected) {
        throw new BadRequestException(`Post Reply does not exist`);
      }
      return true;
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }

  async getReplyById(id: string) {
    try {
      const postReply = await this.findOne({ where: [{ replyId: id }] });
      return postReply;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllReplyByCommentId(commentId: string, page: ReplyPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<ReplyWithMoreInfo> =
      new PagedData<ReplyWithMoreInfo>();

    try {
      const listReply = await this.createQueryBuilder('PostReply')
        .where('PostReply.commentId = :commentId', { commentId: commentId })
        .leftJoin('PostReply.sender', 'Sender')
        .leftJoin('PostReply.postReplyTags', 'PostReplyTag')
        .leftJoin('PostReplyTag.sender', 'User_Tagged')
        .orderBy('PostReply.dateModified', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select(['PostReply', 'Sender', 'PostReplyTag', 'User_Tagged'])
        .getMany();

      const listReplyWithData = listReply.map((data) =>
        ConvertReplyWithMoreInfo(data),
      );

      const totalPost = await this.count({ where: { commentId: commentId } });

      dataReturn.data = listReplyWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return false;
  }
}
