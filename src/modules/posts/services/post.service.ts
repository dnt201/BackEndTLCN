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
import { ViewPostDTO } from '../dtos/viewPost.dto';
import { VotePostDTO } from '../dtos/votePost.dto';
import { FollowPostRepository } from '../repositories/followPost.repository';
import { PostRepository } from '../repositories/post.repository';
import { PostCommentRepository } from '../repositories/postComment.repository';
import { PostReplyRepository } from '../repositories/postCommentReply.repository';
import { PostCommentTagRepository } from '../repositories/postCommentTag.repository';
import { PostVoteRepository } from './../repositories/postVote.repository';
import { PostViewRepository } from './../repositories/postView.repository';
import { FileDTO } from 'src/modules/files/dtos/file.dto';
import { FileService } from 'src/modules/files/services/file.service';
import {
  getCommentWithImageLink,
  getPostWithThumbnailLink,
  getReplyWithImageLink,
} from 'src/utils/getImageLinkUrl';
import { CompareTwoImage } from 'src/utils/compareTwoImage';
import { PostReplyTagRepository } from '../repositories/postReplyTag.repository';
import { CreatePostReplyDTO } from '../dtos/createReply.dto';
import { CommentPage } from '../dtos/commentPage.dto';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postViewRepository: PostViewRepository,
    private readonly postVoteRepository: PostVoteRepository,
    private readonly postCommentRepository: PostCommentRepository,
    private readonly postCommentTagRepository: PostCommentTagRepository,
    private readonly postReplyRepository: PostReplyRepository,
    private readonly postReplyTagRepository: PostReplyTagRepository,
    private readonly folowPostRepository: FollowPostRepository,
    private readonly fileService: FileService,

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
    const post = await this.postRepository.getPostById(postId);
    return getPostWithThumbnailLink(post);
  }

  async viewPost(viewPostData: ViewPostDTO) {
    const post = await this.postRepository.getPostById(viewPostData.postId);
    const viewPost = await this.postViewRepository.getPostViewById(
      viewPostData,
    );

    if (post.owner.id !== viewPostData.userId) {
      if (!viewPost) {
        if (viewPostData.userId) {
          const viewPost = await this.postViewRepository.viewPost(viewPostData);
          await this.postViewRepository.save(viewPost);
        }
      } else {
        await this.postViewRepository.save({
          ...viewPost,
          dateModified: new Date(),
        });
      }
    }

    return this.getPostDetailById(viewPostData);
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
      senderId: createData.userCommentId,
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
              senderId: userTag,
              commentId: postComment.commentId,
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
    const comment = await this.postCommentRepository.getCommentById(commentId);
    return comment ? getCommentWithImageLink(comment) : null;
  }

  async replyPost(createData: CreatePostReplyDTO) {
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
      senderId: createData.userCommentId,
      content: createData.replyContent,
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

          const postReplyTag = await this.postReplyTagRepository.createReplyTag(
            {
              senderId: userTag,
              replyId: postReply.replyId,
            },
          );

          await this.postReplyTagRepository.save(postReplyTag);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
      }),
    );

    return postReply;
  }

  async getReplyById(replyId: string) {
    const reply = await this.postReplyRepository.getReplyById(replyId);
    return reply ? getReplyWithImageLink(reply) : null;
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

  async getAllPostWithUser(userId: string, page: PostPage) {
    const listPosts = await this.postRepository.getAllPublicPostByUser(
      userId,
      page,
    );
    return listPosts;
  }

  async getAllPostVoteWithUserId(userId: string, page: PostPage) {
    const listPosts = await this.postVoteRepository.getAllPostVoteWithUserId(
      userId,
      page,
    );
    return listPosts;
  }

  async getAllPostViewWithUserId(userId: string, page: PostPage) {
    const listPosts = await this.postViewRepository.getAllPostViewWithUserId(
      userId,
      page,
    );
    return listPosts;
  }

  async getAllPostFollowWithUserId(userId: string, page: PostPage) {
    const listPosts = await this.folowPostRepository.getAllPostFollowWithUserId(
      userId,
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

  async getAllCommentByPostId(postId: string, page: CommentPage) {
    const listComment = await this.postCommentRepository.getAllCommentByPostId(
      postId,
      page,
    );

    return listComment;
  }

  async getPostDetailById(viewPostData: ViewPostDTO) {
    const PostDetail = await this.postRepository.getPostDetailById(
      viewPostData.postId,
      viewPostData.userId,
    );

    if (!PostDetail)
      throw new NotFoundException(
        `Not found post with id ${viewPostData.postId}`,
      );

    return PostDetail;
  }

  async addThumbnail(postId: string, fileData: FileDTO) {
    const thumbnail = await this.fileService.saveLocalFileData(fileData);
    await this.postRepository.update(postId, {
      thumbnailId: thumbnail.id,
    });
    return `http://localhost:3000/file/${thumbnail.id}`;
  }

  async editImage(postId: string, fileData: FileDTO) {
    const post = await this.getPostById(postId);
    let thumbnailLink = post.thumbnailLink;
    if (thumbnailLink) {
      const part = thumbnailLink.split('/');
      thumbnailLink = part[part.length - 1];
    }
    const oldImage = await this.fileService.getFileById(thumbnailLink);

    if (await CompareTwoImage(oldImage.path, fileData.path)) return;
    else await this.addThumbnail(postId, fileData);
  }

  async addPostCommentImage(commentId: string, fileData: FileDTO) {
    const commentImage = await this.fileService.saveLocalFileData(fileData);
    await this.postCommentRepository.update(commentId, {
      imageId: commentImage.id,
    });
    return `http://localhost:3000/file/${commentImage.id}`;
  }

  async addPostReplyImage(replyId: string, fileData: FileDTO) {
    const replyImage = await this.fileService.saveLocalFileData(fileData);
    await this.postReplyRepository.update(replyId, {
      imageId: replyImage.id,
    });
    return `http://localhost:3000/file/${replyImage.id}`;
  }

  // async editPostCommentImage(commentId: string, fileData: FileDTO) {
  //   const post = await this.getCommentById(commentId);
  //   let thumbnailLink = post.thumbnailLink;
  //   if (thumbnailLink) {
  //     const part = thumbnailLink.split('/');
  //     thumbnailLink = part[part.length - 1];
  //   }
  //   const oldImage = await this.fileService.getFileById(thumbnailLink);

  //   if (await CompareTwoImage(oldImage.path, fileData.path)) return;
  //   else await this.addThumbnail(postId, fileData);
  // }
}
