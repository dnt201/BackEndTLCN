import { ReturnResult } from 'src/common/dto/ReturnResult';
import { CreatePostCommentDTO } from './../dtos/createComment.dto';
import { UpdatePostDTO } from './../dtos/updatePost.dto';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDTO } from './../dtos/createPost.dto';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { Post_Permission as ListPermission } from '../permission/permission';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PagedData } from 'src/common/dto/PageData';
import { PostPage } from '../dtos/postPage.dto';
import { PostWithMoreInfo } from '../dtos/PostWithMoreInfo.dto';

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

  @Put('approve/:id')
  @UseGuards(PermissionGuard(ListPermission.ApprovePost))
  async approvePost(@Param('id') postId: string) {
    const post = await this.postService.approvePost(postId);
    return post;
  }

  @Put('edit/:id')
  @UseGuards(JwtAuthenticationGuard)
  async editPost(
    @Req() request: RequestWithUser,
    @Param('id') postId: string,
    @Body() updatePostData: UpdatePostDTO,
  ) {
    const post = await this.postService.getPostById(postId);
    if (post.owner.id !== request.user.id) {
      throw new BadRequestException(`You can not edit this post`);
    }
    const postUpdated = await this.postService.editPost(postId, updatePostData);
    return postUpdated;
  }

  @Post('/:id/vote')
  @UseGuards(JwtAuthenticationGuard)
  async votePost(
    @Req() request: RequestWithUser,
    @Param('id') postId: string,
    @Body() body,
  ) {
    const post = await this.postService.getPostById(postId);
    if (!post) {
      throw new BadRequestException(`Not found post with id ${postId}`);
    }

    const vote = await this.postService.votePost({
      userId: request.user.id,
      postId: postId,
      type: body.type === 'Upvote' ? true : false,
    });
    return vote;
  }

  @Post('/:id/comment')
  @UseGuards(JwtAuthenticationGuard)
  async commentPost(
    @Req() request: RequestWithUser,
    @Param('id') postId: string,
    @Body() createPostCommentData: CreatePostCommentDTO,
  ) {
    const userCommentId = request.user.id;

    if ((await this.isExistPost(postId)) === false) {
      throw new BadRequestException(`Not found post with id ${postId}`);
    }

    const postComment = await this.postService.commentPost({
      ...createPostCommentData,
      userCommentId: userCommentId,
      postId: postId,
    });
    return postComment;
  }

  @Post('/:id/reply')
  @UseGuards(JwtAuthenticationGuard)
  async replyPost(
    @Req() request: RequestWithUser,
    @Param('id') commentId: string,
    @Body() createPostCommentData: CreatePostCommentDTO,
  ) {
    const userReplyId = request.user.id;

    const existComment = await this.isExistComment(commentId);
    if (existComment === false) {
      throw new BadRequestException(`Not found comment with id ${commentId}`);
    }

    const postReply = await this.postService.replyPost({
      ...createPostCommentData,
      userCommentId: userReplyId,
      commentId: commentId,
    });
    return postReply;
  }

  @Get('/allPost')
  async getAllPostWithNoLogin(@Body() page: PostPage) {
    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();

    const listPost = await this.postService.getAllPost(page);

    dataReturn.result = listPost;
    dataReturn.message = null;

    return dataReturn;
  }

  @Get('/all')
  @UseGuards(JwtAuthenticationGuard)
  async getAllPostWithLogin(
    @Req() request: RequestWithUser,
    @Body() page: PostPage,
  ) {
    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();

    const userId = request.user.id;
    const listPost = await this.postService.getAllPostWithLoginAccount(
      page,
      userId,
    );
    // const listPost = await this.postService.getAllPost(page);

    dataReturn.result = listPost;
    dataReturn.message = null;

    return dataReturn;
  }

  @Post('/:id/follow')
  @UseGuards(JwtAuthenticationGuard)
  async followPost(
    @Req() request: RequestWithUser,
    @Param('id') postId: string,
  ) {
    const post = await this.postService.getPostById(postId);
    if (!post) {
      throw new BadRequestException(`Not found post with id ${postId}`);
    }

    const followData = await this.postService.followPost({
      userId: request.user.id,
      postId: postId,
    });
    return followData;
  }

  private async isExistPost(postId: string): Promise<boolean> {
    const post = await this.postService.getPostById(postId);
    return !!post;
  }

  private async isExistComment(commentId: string): Promise<boolean> {
    const comment = await this.postService.getCommentById(commentId);
    return !!comment;
  }
}
