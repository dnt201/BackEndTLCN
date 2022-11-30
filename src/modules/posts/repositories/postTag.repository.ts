import {
  BadRequestException,
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

  async deletePostTag(id: string) {
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
      // const listPostTag = await this.find({
      //   where: {
      //     displayName: ILike(`%${dataSearch}%`),
      //   },
      //   order: orderQuery,
      //   take: takeQuery,
      //   skip: (skipQuery - 1) * takeQuery,
      // });
      const listPostTag = await this.createQueryBuilder('PostTag')
        .where('PostTag.displayName ILIKE :displayName', {
          displayName: `%${dataSearch}%`,
        })
        .leftJoinAndSelect('PostTag.posts', 'Post')
        .loadRelationCountAndMap(
          'PostTag.PostCount',
          'PostTag.posts',
          'PostWithPostTag',
          (subQuery) =>
            subQuery.andWhere('PostWithPostTag.isPublic = :isPublic', {
              isPublic: true,
            }),
        )
        .orderBy(orderQuery)
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select('PostTag')
        .getMany();
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

  async getTopPostTag() {
    let postCount = await this.createQueryBuilder('PostTag')
      .leftJoinAndSelect('PostTag.posts', 'Post')
      .loadRelationCountAndMap(
        'PostTag.PostCount',
        'PostTag.posts',
        'PostWithPostTag',
        (subQuery) =>
          subQuery.andWhere('PostWithPostTag.isPublic = :isPublic', {
            isPublic: true,
          }),
      )
      // .orderBy('Category.PostCount', 'DESC')
      .select('PostTag')
      .getMany();

    postCount = postCount
      .sort((a, b) => (a['PostCount'] < b['PostCount'] ? 1 : -1))
      .slice(0, 5);

    return postCount;
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

  async getAllPostTagDelete(page: PostTagPage, dataSearch: string) {
    const orderQuery =
      page?.order?.length === 0 ? {} : ConvertOrderQuery(page.order);

    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostTag> = new PagedData<PostTag>();

    try {
      const listPostTag = await this.find({
        where: {
          postTagName: ILike(`%${dataSearch}%`),
          deleted: true,
        },
        order: orderQuery,
        take: takeQuery,
        withDeleted: true,
        skip: (skipQuery - 1) * takeQuery,
      });
      const totalPostTag = await this.count({
        where: {
          postTagName: ILike(`%${dataSearch}%`),
          deleted: true,
        },
        withDeleted: true,
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

  async hidePostTag(id: string) {
    try {
      const postTag = await this.getPostTagById(id);
      await this.save({ ...postTag, deleted: true });
      const deletedResponse = await this.softDelete({ id: id });
      if (!deletedResponse.affected) {
        throw new BadRequestException(`Post Tag does not exist`);
      }
      return true;
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }

  async showPostTag(id: string) {
    try {
      const restoreResponse = await this.restore({ id: id });
      if (!restoreResponse.affected) {
        throw new BadRequestException(`Post Tag does not exist`);
      }
      const postTag = await this.getPostTagById(id);
      await this.save({ ...postTag, deleted: false });
      return postTag;
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }
}
