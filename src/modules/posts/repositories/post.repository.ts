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
}
