import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { VoteCommentPostDTO } from '../dtos/voteCommentPost.dto';
import { PostCommentVote } from '../entities/postCommentVote.entity';

@Injectable()
export class PostCommentVoteRepository extends Repository<PostCommentVote> {
  constructor(private dataSource: DataSource) {
    super(PostCommentVote, dataSource.createEntityManager());
  }

  async votePost(votePostData: VoteCommentPostDTO) {
    try {
      const postVote = await this.create(votePostData);
      return postVote;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getVotePostCommentById(userId: string, postCommentId: string) {
    try {
      return await this.findOne({
        where: [{ userId: userId, postCommentId: postCommentId }],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateVotePost(voteCommentPostData: VoteCommentPostDTO) {
    try {
      const vote = await this.getVotePostCommentById(
        voteCommentPostData.userId,
        voteCommentPostData.postCommentId,
      );
      await this.save({ ...vote, type: voteCommentPostData.type });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteVote(userId: string, postCommentId: string) {
    try {
      const deletedResponse = await this.delete({
        userId: userId,
        postCommentId: postCommentId,
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
}
