import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostTagDTO } from '../dtos/createPostTag.dto';
import { UpdatePostTagDTO } from '../dtos/updatePostTag.dto';
import { PostTagRepository } from '../repositories/postTag.repository';

@Injectable()
export class PostTagService {
  constructor(private readonly postTagRepository: PostTagRepository) {}

  async createPostTag(createPostTagData: CreatePostTagDTO) {
    const existPostTag = await this.postTagRepository.getPostSameInfo(
      createPostTagData,
    );

    if (existPostTag.length > 0) {
      if (existPostTag[0].colorCode === createPostTagData.colorCode)
        throw new BadRequestException(`Same color code. Try another color`);
      else if (existPostTag[0].colorCode === createPostTagData.displayName)
        throw new BadRequestException(
          `Post tag display name existed. Try another display name`,
        );
      else
        throw new BadRequestException(`Post tag name exist. Try another name`);
    }
    const newPostTag = await this.postTagRepository.createPostTag(
      createPostTagData,
    );
    await this.postTagRepository.save(newPostTag);
    return newPostTag;
  }

  async updatePostTag(id: string, updatePostTagData: UpdatePostTagDTO) {
    const postTagWithId = await this.postTagRepository.getPostTagById(id);
    const existPostTag = await this.postTagRepository.getPostSameInfo(
      updatePostTagData,
    );

    if (existPostTag.length > 0) {
      existPostTag.forEach((postTag) => {
        if (postTag.id === id) {
        } else if (postTag.colorCode === postTagWithId.colorCode) {
          throw new BadRequestException(`Same color code. Try another color`);
        } else if (postTag.colorCode === postTagWithId.displayName) {
          throw new BadRequestException(
            `Post tag display name existed. Try another display name`,
          );
        } else {
          throw new BadRequestException(
            `Post tag name exist. Try another name`,
          );
        }
      });
    }

    return await this.postTagRepository.updatePostTag(id, updatePostTagData);
  }

  async deletePostTag(id: number) {
    return await this.postTagRepository.deletePostTag(id);
  }

  async getPostTagById(id: string) {
    return await this.postTagRepository.getPostTagById(id);
  }

  async getAllPostTags() {
    return await this.postTagRepository.getAllPostTags();
  }
}
