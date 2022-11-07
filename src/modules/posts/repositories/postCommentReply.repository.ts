import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
}
