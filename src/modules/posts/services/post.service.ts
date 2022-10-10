import { Injectable } from '@nestjs/common';
import { CreatePostDTO } from '../dtos/createPost.dto';
import { PostRepository } from '../repositories/post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createPost(createPostData: CreatePostDTO, ownerId: string) {
    const postData = await this.postRepository.createPost(
      createPostData,
      ownerId,
    );

    await this.postRepository.save(postData);

    return postData;
  }
}
