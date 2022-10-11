import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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
}
