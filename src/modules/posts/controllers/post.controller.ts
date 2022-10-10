import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CreatePostDTO } from './../dtos/createPost.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';

@Controller('post')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseGuards(JwtAuthenticationGuard)
  async createPost(
    @Req() request: RequestWithUser,
    @Body() createPostData: CreatePostDTO,
  ) {
    const ownerId = request.user.id;
    const post = await this.postService.createPost(createPostData, ownerId);
    return post;
  }
}
