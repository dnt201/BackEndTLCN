import { BadRequestException, Injectable } from '@nestjs/common';
import { resizeImage } from 'src/common/pipe/resizeImage.pipe';
import { FileDTO } from 'src/modules/files/dtos/file.dto';
import { FileService } from 'src/modules/files/services/file.service';
import { ImageService } from 'src/modules/images/service/image.service';
import { CompareTwoImage } from 'src/utils/compareTwoImage';
import { getFileInfo } from 'src/utils/getFileInfoFromPath';
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
    private readonly imageService: ImageService,
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
    const imageInfo = await this.imageService.getFullInfoImage(
      data.thumbnailId,
    );
    return getPostTagWithThumbnailLink({ ...data, tinyId: imageInfo?.tinyId });
  }

  async getTopPostTag() {
    const postTagList = await this.postTagRepository.getTopPostTag();
    const postTagWithLink = await Promise.all(
      postTagList.map(async (postTag) => {
        const imageInfo = await this.imageService.getFullInfoImage(
          postTag.thumbnailId,
        );
        return getPostTagWithThumbnailLink({
          ...postTag,
          tinyId: imageInfo?.tinyId,
        });
      }),
    );
    return postTagWithLink;
  }

  async getAllPostTags(page: PostTagPage, dataSearch: string) {
    const postTagList = await this.postTagRepository.getAllPostTags(
      page,
      dataSearch,
    );
    const postTagWithLink = await Promise.all(
      postTagList.data.map(async (postTag) => {
        const imageInfo = await this.imageService.getFullInfoImage(
          postTag.thumbnailId,
        );
        console.log(postTag.thumbnailId, imageInfo);
        return getPostTagWithThumbnailLink({
          ...postTag,
          tinyId: imageInfo?.tinyId,
        });
      }),
    );
    return {
      ...postTagList,
      data: postTagWithLink,
    };
  }

  async addThumbnail(postTagId: string, fileData: FileDTO) {
    const fileInfo = getFileInfo(fileData.path);
    await resizeImage(fileInfo?.destination, fileInfo?.filename);

    const thumbnail = await this.fileService.saveLocalFileData(fileData);
    const tinyThumbnail = await this.fileService.saveLocalFileData({
      ...fileData,
      filename: 'tiny-' + fileData.filename,
      path:
        fileInfo.destination.split('/').slice(1, 3).join('\\') +
        '\\tiny-' +
        fileInfo.filename,
    });

    // Create image
    await this.imageService.saveImage({
      tinyId: tinyThumbnail.id,
      fullId: thumbnail.id,
    });

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
    const postTagWithLink = await Promise.all(
      postTagList.data.map(async (postTag) => {
        const imageInfo = await this.imageService.getFullInfoImage(
          postTag.thumbnailId,
        );
        return getPostTagWithThumbnailLink({
          ...postTag,
          tinyId: imageInfo?.tinyId,
        });
      }),
    );

    return {
      ...postTagList,
      data: postTagWithLink,
    };
  }
  async hidePostTag(id: string) {
    return await this.postTagRepository.hidePostTag(id);
  }

  async showPostTag(id: string) {
    const postTag = await this.postTagRepository.showPostTag(id);
    const imageInfo = await this.imageService.getFullInfoImage(
      postTag.thumbnailId,
    );
    return getPostTagWithThumbnailLink({
      ...postTag,
      tinyId: imageInfo?.tinyId,
    });
  }
}
