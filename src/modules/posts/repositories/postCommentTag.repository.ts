import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PostCommentTagDTO } from '../dtos/createComment.dto';
import { PostCommentTag } from '../entities/postCommentTag.entity';

@Injectable()
export class PostCommentTagRepository extends Repository<PostCommentTag> {
  constructor(private dataSource: DataSource) {
    super(PostCommentTag, dataSource.createEntityManager());
  }

  async createCommentTag(commentTagData: PostCommentTagDTO) {
    try {
      const postCommentTag = await this.create(commentTagData);
      return postCommentTag;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUserTagIdByCommentId(commentId: string) {
    try {
      const commentTags = await this.find({ where: { commentId: commentId } });
      return commentTags;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeCommentTag(commentTagId: string) {
    try {
      await this.delete(commentTagId);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
