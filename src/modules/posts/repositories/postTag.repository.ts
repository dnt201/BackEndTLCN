import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertOrderQuery } from 'src/utils/convertOrderQuery';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreatePostTagDTO } from '../dtos/createPostTag.dto';
import { PostTagPage } from '../dtos/posttagPage.dto';
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

  async updatePostTag(id: string, updatePostTagData: UpdatePostTagDTO) {
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

  async getPostTagById(id: string) {
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

  async getAllPostTags(page: PostTagPage, dataSearch: string) {
    const orderQuery =
      page?.order?.length === 0 ? {} : ConvertOrderQuery(page.order);

    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostTag> = new PagedData<PostTag>();

    try {
      const listPostTag = await this.find({
        where: {
          displayName: ILike(`%${dataSearch}%`),
        },
        order: orderQuery,
        take: takeQuery,
        skip: (skipQuery - 1) * takeQuery,
      });
      const totalPostTag = await this.count({
        where: {
          displayName: ILike(`%${dataSearch}%`),
        },
      });

      dataReturn.data = listPostTag;
      dataReturn.page = new Page(
        takeQuery,
        skipQuery,
        totalPostTag,
        page?.order ?? [],
      );
      return dataReturn;
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
