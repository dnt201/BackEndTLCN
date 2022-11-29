import { BadRequestException, Injectable } from '@nestjs/common';
import { FileDTO } from 'src/modules/files/dtos/file.dto';
import { FileService } from 'src/modules/files/services/file.service';
import { CompareTwoImage } from 'src/utils/compareTwoImage';
import { getPostTagWithThumbnailLink } from 'src/utils/getImageLinkUrl';
import { CreatePostTagDTO } from '../dtos/createPostTag.dto';
import { PostTagPage } from '../dtos/posttagPage.dto';
import { UpdatePostTagDTO } from '../dtos/updatePostTag.dto';
import { PostTagRepository } from '../repositories/postTag.repository';

@Injectable()
export class PostTagService {
  constructor(
    private readonly postTagRepository: PostTagRepository,
    private readonly fileService: FileService,
  ) {}

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

  async deletePostTag(id: string) {
    return await this.postTagRepository.deletePostTag(id);
  }

  async getPostTagById(id: string) {
    const data = await this.postTagRepository.getPostTagById(id);
    return getPostTagWithThumbnailLink(data);
  }

  async getTopPostTag() {
    const postTagList = await this.postTagRepository.getTopPostTag();
    const postTagWithLink = postTagList.map((postTag) => {
      return getPostTagWithThumbnailLink(postTag);
    });
    return postTagWithLink;
  }

  async getAllPostTags(page: PostTagPage, dataSearch: string) {
    const postTagList = await this.postTagRepository.getAllPostTags(
      page,
      dataSearch,
    );
    const postTagWithLink = postTagList.data.map((postTag) => {
      return getPostTagWithThumbnailLink(postTag);
    });
    return {
      ...postTagList,
      data: postTagWithLink,
    };
  }

  async addThumbnail(postTagId: string, fileData: FileDTO) {
    const thumbnail = await this.fileService.saveLocalFileData(fileData);
    await this.postTagRepository.update(postTagId, {
      thumbnailId: thumbnail.id,
    });
    return `http://localhost:3000/file/${thumbnail.id}`;
  }

  async editImage(postTagId: string, fileData: FileDTO) {
    const post = await this.getPostTagById(postTagId);
    let thumbnailLink = post.thumbnailLink;
    if (thumbnailLink) {
      const part = thumbnailLink.split('/');
      thumbnailLink = part[part.length - 1];
    }

    const oldImage = thumbnailLink
      ? await this.fileService.getFileById(thumbnailLink)
      : { path: null };

    if (await CompareTwoImage(oldImage.path, fileData.path)) return;
    else {
      await this.addThumbnail(postTagId, fileData);
    }
  }

  async getAllPostTagDelete(page: PostTagPage, dataSearch: string) {
    const postTagList = await this.postTagRepository.getAllPostTagDelete(
      page,
      dataSearch,
    );
    const PostTagWithLink = postTagList.data.map((postTag) => {
      return getPostTagWithThumbnailLink(postTag);
    });

    return {
      ...postTagList,
      data: PostTagWithLink,
    };
  }
  async hidePostTag(id: string) {
    return await this.postTagRepository.hidePostTag(id);
  }

  async showPostTag(id: string) {
    const postTag = await this.postTagRepository.showPostTag(id);
    return getPostTagWithThumbnailLink(postTag);
  }
}
