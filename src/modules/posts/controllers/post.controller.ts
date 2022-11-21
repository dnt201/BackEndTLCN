import { ReturnResult } from 'src/common/dto/ReturnResult';
import {
  CreatePostCommentDTO,
  CreatePostCommentInput,
} from './../dtos/createComment.dto';
// import { UpdatePostDTO } from './../dtos/updatePost.dto';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  PayloadTooLargeException,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDTO, CreatePostInput } from './../dtos/createPost.dto';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';
import { Post_Permission as ListPermission } from '../permission/permission';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PagedData } from 'src/common/dto/PageData';
import { PostPage } from '../dtos/postPage.dto';
import { PostWithMoreInfo } from '../dtos/PostWithMoreInfo.dto';
import { getTypeHeader } from 'src/utils/getTypeHeader';
import { HeaderNotification } from 'src/common/constants/HeaderNotification.constant';
import { GetAllPostByPostTag } from '../dtos/getAllPostByPostTag.dto';
import { FilesInterceptor } from 'src/modules/files/interceptors/file.interceptor';
import { UpdatePostDTO } from '../dtos/updatePost.dto';
import {
  CreatePostReplyDTO,
  CreatePostReplyInput,
} from '../dtos/createReply.dto';
import { CommentPage } from '../dtos/commentPage.dto';
import {
  UpdatePostCommentDTO,
  UpdatePostCommentInput,
} from '../dtos/updatePostComment.dto';
import {
  UpdatePostReplyDTO,
  UpdatePostReplyInput,
} from '../dtos/updatePostReply.dto';

@Controller('post')
@UseInterceptors(ClassSerializerInterceptor)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async createPost(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostInput: CreatePostInput,
  ) {
    const ownerId = request.user.id;
    const createPostData: CreatePostDTO = {
      ...createPostInput,
      tags: createPostInput.tags.split(','),
    };

    const post = await this.postService.createPost(createPostData, ownerId);

    if (file) {
      await this.postService.addThumbnail(post.id, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }
    return await this.postService.getPostById(post.id);
  }

  @Put('approve/:id')
  @UseGuards(PermissionGuard(ListPermission.ApprovePost))
  async approvePost(@Param('id') postId: string) {
    const post = await this.postService.approvePost(postId);
    return post;
  }

  @Put('edit/:id')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async editPost(
    @Req() request: RequestWithUser,
    @Param('id') postId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostInput: CreatePostInput,
  ) {
    const post = await this.postService.getPostById(postId);
    console.log(post);
    if (!post?.id) {
      throw new NotFoundException(`Not found post with id: ${postId}`);
    }
    if (post.owner.id !== request.user.id) {
      throw new BadRequestException(`You can not edit this post`);
    }

    const updatePostData: UpdatePostDTO = {
      ...createPostInput,
      tags: createPostInput.tags.split(','),
    };

    await this.postService.editPost(postId, updatePostData);
    if (file) {
      await this.postService.editImage(postId, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }

    return await this.postService.getPostById(postId);
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
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post-comment',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async commentPost(
    @Req() request: RequestWithUser,
    @Param('id') postId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostCommentInput: CreatePostCommentInput,
  ) {
    const userCommentId = request.user.id;

    if ((await this.isExistPost(postId)) === false) {
      throw new BadRequestException(`Not found post with id ${postId}`);
    }
    const userTagList = createPostCommentInput.userTag
      .split(',')
      .filter((userTag) => userTag !== '');

    const createPostCommentData: CreatePostCommentDTO = {
      ...createPostCommentInput,
      userTag: userTagList,
      userCommentId: userCommentId,
      postId: postId,
    };

    const postComment = await this.postService.commentPost(
      createPostCommentData,
    );

    if (file) {
      await this.postService.addPostCommentImage(postComment.commentId, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }

    return await this.postService.getCommentById(postComment.commentId);
  }

  @Put('comment/edit/:id')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post-comment',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async editPostComment(
    @Req() request: RequestWithUser,
    @Param('id') commentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePostCommentInput: UpdatePostCommentInput,
  ) {
    const userCommentId = request.user.id;
    const oldComment = await this.postService.getCommentById(commentId);

    if (oldComment?.senderId !== userCommentId) {
      throw new BadRequestException(`You can not edit this comment`);
    }

    const userTagList = updatePostCommentInput.userTag
      .split(',')
      .filter((userTag) => userTag !== '');

    const updatePostCommentData: UpdatePostCommentDTO = {
      ...updatePostCommentInput,
      userTag: userTagList,
      userCommentId: userCommentId,
      postId: oldComment.postId,
    };

    await this.postService.editCommentPost(commentId, updatePostCommentData);

    if (file) {
      await this.postService.editPostCommentImage(commentId, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }

    return await this.postService.getCommentById(commentId);
  }

  @Post('comment/:id/vote')
  @UseGuards(JwtAuthenticationGuard)
  async votePostComment(
    @Req() request: RequestWithUser,
    @Param('id') postCommentId: string,
    @Body() body,
  ) {
    const postComment = await this.postService.getCommentById(postCommentId);
    if (!postComment) {
      throw new BadRequestException(
        `Not found comment with id ${postCommentId}`,
      );
    }
    if (postComment.senderId === request.user.id) {
      throw new BadRequestException(`You can not vote your comment!`);
    }

    const vote = await this.postService.voteCommentPost({
      userId: request.user.id,
      postCommentId: postCommentId,
      type: body.type === 'Upvote' ? true : false,
    });
    return vote;
  }

  @Post('/:id/reply')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post-reply',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async replyPost(
    @Req() request: RequestWithUser,
    @Param('id') commentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostReplyInput: CreatePostReplyInput,
  ) {
    const userReplyId = request.user.id;

    const existComment = await this.isExistComment(commentId);
    if (existComment === false) {
      throw new BadRequestException(`Not found comment with id ${commentId}`);
    }

    const userTagList = createPostReplyInput.userTag
      .split(',')
      .filter((userTag) => userTag !== '');

    const createPostReplyData: CreatePostReplyDTO = {
      ...createPostReplyInput,
      userTag: userTagList,
      userCommentId: userReplyId,
      commentId: commentId,
    };

    const postReply = await this.postService.replyPost(createPostReplyData);

    if (file) {
      await this.postService.addPostReplyImage(postReply.replyId, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }

    return await this.postService.getReplyById(postReply.replyId);
  }

  @Put('reply/edit/:id')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post-reply',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async editPostReply(
    @Req() request: RequestWithUser,
    @Param('id') replyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updatePostReplyInput: UpdatePostReplyInput,
  ) {
    const userReplyId = request.user.id;
    const oldReply = await this.postService.getReplyById(replyId);

    if (oldReply.senderId !== userReplyId) {
      throw new BadRequestException(`You can not edit this comment`);
    }

    const userTagList = updatePostReplyInput.userTag
      .split(',')
      .filter((userTag) => userTag !== '');

    const updatePostCommentData: UpdatePostReplyDTO = {
      ...updatePostReplyInput,
      userTag: userTagList,
      userCommentId: userReplyId,
      commentId: oldReply.commentId,
    };

    await this.postService.editReplyPost(replyId, updatePostCommentData);

    if (file) {
      await this.postService.editPostReplyImage(replyId, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }

    return await this.postService.getReplyById(replyId);
  }

  @Get('/all')
  async getAllPost(
    @Headers() headers,
    @Body() page: PostPage,
    @Query() searchData,
  ) {
    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();
    const data = getTypeHeader(headers);

    let dataSearch = '';
    if (searchData['name'] && searchData['name'].length > 0)
      dataSearch = searchData['name'];

    if (data.message === HeaderNotification.WRONG_AUTHORIZATION) {
      throw new UnauthorizedException();
    } else {
      const listPost = await this.postService.getAllPost(page, dataSearch);

      if (data.message === HeaderNotification.TRUE_AUTHORIZATION) {
        const userId = data.result;
        const listPostWithFollowInfo = await Promise.all(
          listPost.data.map(async (data) => {
            const isFollow = this.postService.getFollowPostById(
              String(userId),
              data.id,
            );
            return { ...data, isFollow: isFollow ? true : false };
          }),
        );
        listPost.data = listPostWithFollowInfo;
      }

      dataReturn.result = listPost;
      dataReturn.message = null;
      return dataReturn;
    }
  }

  // @Get('/all')
  // @UseGuards(JwtAuthenticationGuard)
  // async getAllPostWithLogin(
  //   @Req() request: RequestWithUser,
  //   @Body() page: PostPage,
  // ) {
  //   const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
  //     new ReturnResult<PagedData<PostWithMoreInfo>>();

  //   const userId = request.user.id;
  //   const listPost = await this.postService.getAllPostWithLoginAccount(
  //     page,
  //     userId,
  //   );
  //   // const listPost = await this.postService.getAllPost(page);

  //   dataReturn.result = listPost;
  //   dataReturn.message = null;

  //   return dataReturn;
  // }

  @Get('/all-by-category/:id')
  async getAllPostWithCategory(
    @Headers() headers,
    @Param('id') categoryId: string,
    @Body() page: PostPage,
  ) {
    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();
    const data = getTypeHeader(headers);

    if (data.message === HeaderNotification.WRONG_AUTHORIZATION) {
      throw new UnauthorizedException();
    } else {
      const listPost = await this.postService.getAllPostWithCategory(
        categoryId,
        page,
      );

      if (data.message === HeaderNotification.TRUE_AUTHORIZATION) {
        const userId = data.result;
        const listPostWithFollowInfo = await Promise.all(
          listPost.data.map(async (data) => {
            const isFollow = this.postService.getFollowPostById(
              String(userId),
              data.id,
            );
            return { ...data, isFollow: isFollow ? true : false };
          }),
        );
        listPost.data = listPostWithFollowInfo;
      }

      dataReturn.result = listPost;
      dataReturn.message = null;
      return dataReturn;
    }
  }

  @Get('/all-by-posttag')
  async getAllPostWithPostTag(
    @Headers() headers,
    @Body() body: GetAllPostByPostTag,
  ) {
    const listPostTags = body.postTags;
    const page = body.page ?? null;

    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();
    const data = getTypeHeader(headers);

    if (data.message === HeaderNotification.WRONG_AUTHORIZATION) {
      throw new UnauthorizedException();
    } else {
      const listPost = await this.postService.getAllPostWithPostTag(
        listPostTags,
        page,
      );

      if (data.message === HeaderNotification.TRUE_AUTHORIZATION) {
        const userId = data.result;
        const listPostWithFollowInfo = await Promise.all(
          listPost.data.map(async (data) => {
            const isFollow = this.postService.getFollowPostById(
              String(userId),
              data.id,
            );
            return { ...data, isFollow: isFollow ? true : false };
          }),
        );
        listPost.data = listPostWithFollowInfo;
      }

      dataReturn.result = listPost;
      dataReturn.message = null;
      return dataReturn;
    }
  }

  @Get('/all-by-user/:id')
  async getAllPostWithUser(
    @Headers() headers,
    @Param('id') userId: string,
    @Body() page: PostPage,
  ) {
    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();
    const data = getTypeHeader(headers);

    if (data.message === HeaderNotification.WRONG_AUTHORIZATION) {
      throw new UnauthorizedException();
    } else {
      const listPost = await this.postService.getAllPostWithUser(userId, page);

      if (data.message === HeaderNotification.TRUE_AUTHORIZATION) {
        const userId = data.result;
        const listPostWithFollowInfo = await Promise.all(
          listPost.data.map(async (data) => {
            const isFollow = this.postService.getFollowPostById(
              String(userId),
              data.id,
            );
            return { ...data, isFollow: isFollow ? true : false };
          }),
        );
        listPost.data = listPostWithFollowInfo;
      }

      dataReturn.result = listPost;
      dataReturn.message = null;
      return dataReturn;
    }
  }

  @Get('all-post-vote')
  @UseGuards(JwtAuthenticationGuard)
  async getAllPostVoteByUserId(
    @Req() request: RequestWithUser,
    @Body() page: PostPage,
  ) {
    const userId = request.user.id;

    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();

    const listPost = await this.postService.getAllPostVoteWithUserId(
      userId,
      page,
    );
    const listPostWithFollowInfo = await Promise.all(
      listPost.data.map(async (data) => {
        const isFollow = this.postService.getFollowPostById(
          String(userId),
          data.id,
        );
        return { ...data, isFollow: isFollow ? true : false };
      }),
    );
    listPost.data = listPostWithFollowInfo;

    dataReturn.result = listPost;
    dataReturn.message = null;
    return dataReturn;
  }

  @Get('all-post-view')
  @UseGuards(JwtAuthenticationGuard)
  async getAllPostViewByUserId(
    @Req() request: RequestWithUser,
    @Body() page: PostPage,
  ) {
    const userId = request.user.id;

    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();

    const listPost = await this.postService.getAllPostViewWithUserId(
      userId,
      page,
    );
    const listPostWithFollowInfo = await Promise.all(
      listPost.data.map(async (data) => {
        const isFollow = this.postService.getFollowPostById(
          String(userId),
          data.id,
        );
        return { ...data, isFollow: isFollow ? true : false };
      }),
    );
    listPost.data = listPostWithFollowInfo;

    dataReturn.result = listPost;
    dataReturn.message = null;
    return dataReturn;
  }

  @Get('all-post-follow')
  @UseGuards(JwtAuthenticationGuard)
  async getAllPostFollowByUserId(
    @Req() request: RequestWithUser,
    @Body() page: PostPage,
  ) {
    const userId = request.user.id;

    const dataReturn: ReturnResult<PagedData<PostWithMoreInfo>> =
      new ReturnResult<PagedData<PostWithMoreInfo>>();

    const listPost = await this.postService.getAllPostFollowWithUserId(
      userId,
      page,
    );
    const listPostWithFollowInfo = await Promise.all(
      listPost.data.map(async (data) => {
        const isFollow = this.postService.getFollowPostById(
          String(userId),
          data.id,
        );
        return { ...data, isFollow: isFollow ? true : false };
      }),
    );
    listPost.data = listPostWithFollowInfo;

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

  @Get('/:id/get-all-comment')
  async getAllComment(@Param('id') postId: string, @Body() page: CommentPage) {
    const post = await this.postService.getPostById(postId);
    if (!post) {
      throw new BadRequestException(`Not found post with id ${postId}`);
    }

    return await this.postService.getAllCommentByPostId(postId, page);
  }

  @Get('/:id')
  async getPostDetail(@Headers() headers, @Param('id') postId: string) {
    const data = getTypeHeader(headers);

    if (data.message === HeaderNotification.WRONG_AUTHORIZATION) {
      throw new UnauthorizedException();
    } else {
      const listPost = await this.postService.viewPost({
        userId: data.result ? String(data.result) : undefined,
        postId: postId,
      });
      return listPost;
    }
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
