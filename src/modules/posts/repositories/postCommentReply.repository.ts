import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PostReplyDTO } from '../dtos/createReply.dto';
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
}
