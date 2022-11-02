import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { CreatePostCommentDTO } from '../dtos/createComment.dto';
import { CreatePostDTO } from '../dtos/createPost.dto';
import { FollowPostDTO } from '../dtos/followPost.dto';
import { PostPage } from '../dtos/postPage.dto';
import { UpdatePostDTO } from '../dtos/updatePost.dto';
import { VotePostDTO } from '../dtos/votePost.dto';
import { FollowPostRepository } from '../repositories/followPost.repository';
import { PostRepository } from '../repositories/post.repository';
import { PostCommentRepository } from '../repositories/postComment.repository';
import { PostReplyRepository } from '../repositories/postCommentReply.repository';
import { PostCommentTagRepository } from '../repositories/postCommentTag.repository';
import { PostVoteRepository } from './../repositories/postVote.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postVoteRepository: PostVoteRepository,
    private readonly postCommentRepository: PostCommentRepository,
    private readonly postCommentTagRepository: PostCommentTagRepository,
    private readonly postReplyRepository: PostReplyRepository,
    private readonly folowPostRepository: FollowPostRepository,

    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

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

  async votePost(votePostData: VotePostDTO) {
    const user = await this.userService.getUserById(votePostData.userId);
    const post = await this.getPostById(votePostData.postId);
    const upVote = votePostData.type === true ? 1 : -1;

    if (!user) {
      throw new NotFoundException(
        `Can not found user with id: ${votePostData.userId}`,
      );
    } else if (!post) {
      throw new NotFoundException(
        `Can not find post with id: ${votePostData.postId}`,
      );
    }

    const votePost = await this.postVoteRepository.getVotePostById(
      votePostData.userId,
      votePostData.postId,
    );
    if (!votePost) {
      const votePost = await this.postVoteRepository.votePost(votePostData);
      await this.postVoteRepository.save(votePost);
      await this.postRepository.update(votePostData.postId, {
        vote: post.vote + upVote,
      });
    } else if (votePost.type === votePostData.type) {
      await this.postVoteRepository.deleteVote(
        votePostData.userId,
        votePostData.postId,
      );

      await this.postRepository.update(votePostData.postId, {
        vote: post.vote - upVote,
      });
    } else {
      await this.postVoteRepository.updateVotePost(votePostData);
      await this.postRepository.update(votePostData.postId, {
        vote: post.vote + 2 * upVote,
      });
    }

    return true;
  }

  async commentPost(createData: CreatePostCommentDTO) {
    const user = await this.userService.getUserById(createData.userCommentId);
    const post = await this.getPostById(createData.postId);
    if (!user) {
      throw new NotFoundException(
        `Can not found user with id: ${createData.userCommentId}`,
      );
    } else if (!post) {
      throw new NotFoundException(
        `Can not find post with id: ${createData.postId}`,
      );
    }

    const postComment = await this.postCommentRepository.createComment({
      postId: createData.postId,
      userId: createData.userCommentId,
      content: createData.commentContent,
    });
    await this.postCommentRepository.save(postComment);

    Promise.all(
      createData.userTag.map(async (userTag) => {
        try {
          const userOnTag = await this.userService.getUserById(userTag);
          if (!userOnTag) {
            throw new NotFoundException(
              `Can not found user with id: ${userTag}`,
            );
          }

          const postCommentTag =
            await this.postCommentTagRepository.createCommentTag({
              userId: userTag,
              commentId: postComment.commentId,
              typeOfComment: 'Comment',
            });

          await this.postCommentTagRepository.save(postCommentTag);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
      }),
    );

    return postComment;
  }

  async getCommentById(commentId: string) {
    return await this.postCommentRepository.getCommentById(commentId);
  }

  async replyPost(createData: CreatePostCommentDTO) {
    const user = await this.userService.getUserById(createData.userCommentId);
    const comment = await this.getCommentById(createData.commentId);
    if (!user) {
      throw new NotFoundException(
        `Can not found user with id: ${createData.userCommentId}`,
      );
    } else if (!comment) {
      throw new NotFoundException(
        `Can not find comment with id: ${createData.commentId}`,
      );
    }

    const postReply = await this.postReplyRepository.createReply({
      commentId: createData.commentId,
      userId: createData.userCommentId,
      content: createData.commentContent,
    });
    await this.postReplyRepository.save(postReply);

    Promise.all(
      createData.userTag.map(async (userTag) => {
        try {
          const userOnTag = await this.userService.getUserById(userTag);
          if (!userOnTag) {
            throw new NotFoundException(
              `Can not found user with id: ${userTag}`,
            );
          }

          const postCommentTag =
            await this.postCommentTagRepository.createCommentTag({
              userId: userTag,
              commentId: postReply.replyId,
              typeOfComment: 'Reply',
            });

          await this.postCommentTagRepository.save(postCommentTag);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
      }),
    );

    return postReply;
  }

  async getAllPost(page: PostPage) {
    const listPosts = await this.postRepository.getAllPost(page);
    return listPosts;
  }

  async getAllPublicPostByUserId(userId: string) {
    const listPosts = await this.postRepository.getAllPublicPostByUserId(
      userId,
    );
    return listPosts;
  }

  // async getAllPostWithLoginAccount(page: PostPage, userId: string) {
  //   const pagePost = await this.postRepository.getAllPost(page);
  //   const listPost = pagePost.data;
  //   const listPostWithFollowInfo = await Promise.all(
  //     listPost.map(async (data) => {
  //       const isFollow = this.getFollowPostById(userId, data.id);
  //       return { ...data, isFollow: isFollow ? true : false };
  //     }),
  //   );
  //   pagePost.data = listPostWithFollowInfo;
  //   return pagePost;
  // }

  async followPost(followData: FollowPostDTO) {
    const user = await this.userService.getUserById(followData.userId);
    const post = await this.getPostById(followData.postId);

    if (!user) {
      throw new NotFoundException(
        `Can not found user with id: ${followData.userId}`,
      );
    } else if (!post) {
      throw new NotFoundException(
        `Can not find post with id: ${followData.postId}`,
      );
    }

    const followPostData = await this.folowPostRepository.getFollowPostById(
      followData.userId,
      followData.postId,
    );

    if (!followPostData) {
      const votePost = await this.folowPostRepository.followPost(followData);
      await this.folowPostRepository.save(votePost);
    } else {
      await this.folowPostRepository.unfollowPost(followData);
    }

    return true;
  }

  async getFollowPostById(userId: string, postId: string) {
    return this.folowPostRepository.getFollowPostById(userId, postId);
  }

  async getAllPostWithCategory(categoryId: string, page: PostPage) {
    const listPosts = await this.postRepository.getAllPublicPostByCategoryId(
      categoryId,
      page,
    );
    return listPosts;
  }

  async getAllPostWithPostTag(postTags: string[], page: PostPage) {
    const listPosts = await this.postRepository.getAllPublicPostByPostTagId(
      postTags,
      page,
    );
    return listPosts;
  }
}
