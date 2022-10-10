import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDTO } from '../dtos/createPost.dto';
import { UpdatePostDTO } from '../dtos/updatePost.dto';
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

  async approvePost(postId: string) {
    const post = await this.postRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post ${postId} does not exist`);
    }
    await this.postRepository.approvePost(postId);
    return await this.postRepository.getPostById(postId);
  }

  async editPost(postId: string, updatePostData: UpdatePostDTO) {
    const post = await this.postRepository.getPostById(postId);
    if (!post) {
      throw new NotFoundException(`Post ${postId} does not exist`);
    }
    await this.postRepository.updatePost(postId, updatePostData);
    return await this.postRepository.getPostById(postId);
  }

  async getPostById(postId: string) {
    return await this.postRepository.getPostById(postId);
  }
}
