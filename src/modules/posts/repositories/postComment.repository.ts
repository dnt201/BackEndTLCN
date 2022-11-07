import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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
}
