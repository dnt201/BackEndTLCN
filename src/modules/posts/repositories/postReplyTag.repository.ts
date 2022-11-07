import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PostReplyTagDTO } from '../dtos/createReply.dto';
import { PostReplyTag } from '../entities/postReplyTag.entity';

@Injectable()
export class PostReplyTagRepository extends Repository<PostReplyTag> {
  constructor(private dataSource: DataSource) {
    super(PostReplyTag, dataSource.createEntityManager());
  }

  async createReplyTag(replyTagData: PostReplyTagDTO) {
    try {
      const postReplyTag = await this.create(replyTagData);
      return postReplyTag;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
