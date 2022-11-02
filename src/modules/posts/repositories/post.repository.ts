import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';

import { Post } from '../entities/post.entity';
import { CreatePostDTO } from '../dtos/createPost.dto';
import { UsersService } from '../../users/services/users.service';
import { CategoryService } from '../../categories/services/category.service';
import { PostTagService } from '../services/postTag.service';
import { UpdatePostDTO } from '../dtos/updatePost.dto';
import { PostPage } from '../dtos/postPage.dto';
// import { ConvertOrderQuery } from 'src/utils/convertOrderQuery';
import { PostWithMoreInfo } from '../dtos/PostWithMoreInfo.dto';
import { ConvertPostWithMoreInfo } from 'src/utils/convertPostWithMoreInfo';
import { PagedData } from 'src/common/dto/PageData';
import { Page } from 'src/common/dto/Page';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(
    private dataSource: DataSource,

    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,

    private readonly categoryService: CategoryService,
    private readonly postTagService: PostTagService,
  ) {
    super(Post, dataSource.createEntityManager());
  }

  async getPostById(postId: string) {
    try {
      const post = await this.findOne({
        where: [{ id: postId }],
        relations: { owner: true, category: true, tags: true },
      });
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createPost(createPostData: CreatePostDTO, userId: string) {
    try {
      let category;

      const user = await this.userService.getUserById(userId);

      if (createPostData.category) {
        category = await this.categoryService.getCategoryById(
          createPostData.category,
        );
      } else {
        category = null;
      }

      const postTags = await Promise.all(
        createPostData.tags.map(async (tagId) => {
          try {
            const tag = await this.postTagService.getPostTagById(tagId);
            if (!tag)
              throw new NotFoundException(`Not found tag with id ${tagId}`);
            return tag;
          } catch (error) {
            throw new NotFoundException(error.message);
          }
        }),
      );

      return await this.create({
        ...createPostData,
        owner: user,
        category: category,
        tags: postTags,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async approvePost(postId: string) {
    try {
      const post = await this.findOne({ where: [{ id: postId }] });
      await this.update(postId, { ...post, isPublic: true });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePost(postId: string, updatePostData: UpdatePostDTO) {
    try {
      let category;
      const post = await this.findOne({ where: [{ id: postId }] });

      if (updatePostData.category) {
        category = await this.categoryService.getCategoryById(
          updatePostData.category,
        );
      } else {
        category = null;
      }

      const postTags = await Promise.all(
        updatePostData.tags.map(async (tagId) => {
          try {
            const tag = await this.postTagService.getPostTagById(tagId);
            if (!tag)
              throw new NotFoundException(`Not found tag with id ${tagId}`);
            return tag;
          } catch (error) {
            throw new NotFoundException(error.message);
          }
        }),
      );

      await this.save({
        ...post,
        isPublic: false,
        title: updatePostData.title,
        content: updatePostData.content,
        category: category,
        tags: postTags,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPost(page: PostPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostWithMoreInfo> =
      new PagedData<PostWithMoreInfo>();

    try {
      // const listPost = await this.find({
      //   relations: ['owner', 'category', 'tags'],
      //   order: orderQuery,
      //   take: takeQuery,
      //   skip: (skipQuery - 1) * takeQuery,
      // });

      const listPostQuery = await this.createQueryBuilder('post')
        .where('post.isPublic = :isPublic', { isPublic: true })
        .leftJoin('post.postComments', 'PostComment')
        .leftJoin('PostComment.postReplies', 'PostReply')
        .leftJoin('post.owner', 'User')
        .leftJoin('post.category', 'Category')
        .leftJoin('post.tags', 'PostTag')
        .loadRelationCountAndMap('post.commentCount', 'post.postComments')
        .loadRelationCountAndMap(
          'post.replyCount',
          'post.postComments.postReplies',
        )
        .orderBy('post.vote', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'post',
          'PostComment',
          'PostReply',
          'User',
          'Category',
          'PostTag',
        ])
        .getMany();

      const listPostWithData = listPostQuery.map((data) =>
        ConvertPostWithMoreInfo(data),
      );

      const totalPost = await this.count();

      dataReturn.data = listPostWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPublicPostByUserId(userId: string) {
    try {
      const post = await this.find({
        where: [
          {
            owner: {
              id: userId,
            },
            isPublic: true,
          },
        ],
      });
      return post;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPublicPostByCategoryId(categoryId: string, page: PostPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostWithMoreInfo> =
      new PagedData<PostWithMoreInfo>();

    try {
      // const listPost = await this.find({
      //   where: [
      //     {
      //       category: {
      //         id: categoryId,
      //       },
      //       isPublic: true,
      //     },
      //   ],
      //   relations: ['owner', 'category', 'tags'],
      //   order: { vote: 'DESC' },
      //   take: takeQuery,
      //   skip: (skipQuery - 1) * takeQuery,
      // });

      const listPostQuery = await this.createQueryBuilder('post')
        .where('post.isPublic = :isPublic', { isPublic: true })
        .leftJoin('post.postComments', 'PostComment')
        .leftJoin('PostComment.postReplies', 'PostReply')
        .leftJoin('post.owner', 'User')
        .leftJoin('post.category', 'Category')
        .where('Category.id = :categoryId', { categoryId: categoryId })
        .leftJoin('post.tags', 'PostTag')
        .loadRelationCountAndMap('post.commentCount', 'post.postComments')
        .loadRelationCountAndMap(
          'post.replyCount',
          'post.postComments.postReplies',
        )
        .orderBy('post.vote', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'post',
          'PostComment',
          'PostReply',
          'User',
          'Category',
          'PostTag',
        ])
        .getMany();

      const listPostWithData = listPostQuery.map((data) =>
        ConvertPostWithMoreInfo(data),
      );

      const totalPost = await this.count({
        where: {
          isPublic: true,
          category: {
            id: categoryId,
          },
        },
      });

      dataReturn.data = listPostWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPublicPostByPostTagId(postTags: string[], page: PostPage) {
    const takeQuery = page?.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostWithMoreInfo> =
      new PagedData<PostWithMoreInfo>();

    try {
      // const listPost = await this.find({
      //   where: [
      //     {
      //       tags: {
      //         id: In(postTags),
      //       },
      //       isPublic: true,
      //     },
      //   ],
      //   relations: ['owner', 'category', 'tags'],
      //   order: { vote: 'DESC' },
      //   take: takeQuery,
      //   skip: (skipQuery - 1) * takeQuery,
      // });

      const listPostQuery = await this.createQueryBuilder('post')
        .where('post.isPublic = :isPublic', { isPublic: true })
        .leftJoin('post.postComments', 'PostComment')
        .leftJoin('PostComment.postReplies', 'PostReply')
        .leftJoin('post.owner', 'User')
        .leftJoin('post.category', 'Category')
        .leftJoin('post.tags', 'PostTag')
        .where('PostTag.id IN(:...ids)', { ids: postTags })
        .loadRelationCountAndMap('post.commentCount', 'post.postComments')
        .loadRelationCountAndMap(
          'post.replyCount',
          'post.postComments.postReplies',
        )
        .orderBy('post.vote', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'post',
          'PostComment',
          'PostReply',
          'User',
          'Category',
          'PostTag',
        ])
        .getMany();

      const listPostWithData = listPostQuery.map((data) =>
        ConvertPostWithMoreInfo(data),
      );

      const totalPost = await this.count({
        where: {
          isPublic: true,
          tags: {
            id: In(postTags),
          },
        },
      });

      dataReturn.data = listPostWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPublicPostByUser(userId: string, page: PostPage) {
    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<PostWithMoreInfo> =
      new PagedData<PostWithMoreInfo>();

    try {
      const listPostQuery = await this.createQueryBuilder('post')
        .where('post.isPublic = :isPublic', { isPublic: true })
        .leftJoin('post.postComments', 'PostComment')
        .leftJoin('PostComment.postReplies', 'PostReply')
        .leftJoin('post.owner', 'User')
        .where('User.id = :userId', { userId: userId })
        .leftJoin('post.category', 'Category')
        .leftJoin('post.tags', 'PostTag')
        .loadRelationCountAndMap('post.commentCount', 'post.postComments')
        .loadRelationCountAndMap(
          'post.replyCount',
          'post.postComments.postReplies',
        )
        .orderBy('post.vote', 'DESC')
        .take(takeQuery)
        .skip((skipQuery - 1) * takeQuery)
        .select([
          'post',
          'PostComment',
          'PostReply',
          'User',
          'Category',
          'PostTag',
        ])
        .getMany();

      const listPostWithData = listPostQuery.map((data) =>
        ConvertPostWithMoreInfo(data),
      );

      const totalPost = await this.count({
        where: { isPublic: true, owner: { id: userId } },
      });

      dataReturn.data = listPostWithData;
      dataReturn.page = new Page(takeQuery, skipQuery, totalPost, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
