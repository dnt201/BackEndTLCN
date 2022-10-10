import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Post } from '../entities/post.entity';
import { CreatePostDTO } from '../dtos/createPost.dto';
import { UsersService } from '../../users/services/users.service';
import { CategoryService } from '../../categories/services/category.service';
import { PostTagService } from '../services/postTag.service';
import { UpdatePostDTO } from '../dtos/updatePost.dto';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(
    private dataSource: DataSource,
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
}
