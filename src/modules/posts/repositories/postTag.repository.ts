import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreatePostTagDTO } from '../dtos/createPostTag.dto';
import { UpdatePostTagDTO } from '../dtos/updatePostTag.dto';
import { PostTag } from '../entities/postTag.entity';

@Injectable()
export class PostTagRepository extends Repository<PostTag> {
  constructor(private dataSource: DataSource) {
    super(PostTag, dataSource.createEntityManager());
  }

  async createPostTag(createPostTagData: CreatePostTagDTO) {
    try {
      return await this.create(createPostTagData);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePostTag(id: number, updatePostTagData: UpdatePostTagDTO) {
    try {
      await this.update(id, updatePostTagData);
      return await this.getPostTagById(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deletePostTag(id: number) {
    try {
      const deletedResponse = await this.delete(id);
      if (!deletedResponse.affected) {
        throw new NotFoundException(`Post Tag with id: ${id} does not exist`);
      }
      return true;
    } catch (error) {
      if (error.code === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }

  async getPostTagById(id: number) {
    try {
      return await this.findOne({ where: [{ id: id }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostTagByDisplayName(displayName: string) {
    try {
      return await this.findOne({ where: [{ displayName: displayName }] });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPostTags() {
    try {
      return await this.find({});
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostSameInfo(postTagData: CreatePostTagDTO) {
    try {
      return await this.find({
        where: [
          { postTagName: postTagData.postTagName },
          { displayName: postTagData.displayName },
          { colorCode: postTagData.colorCode },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
