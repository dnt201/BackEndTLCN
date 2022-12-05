import { NoticationType } from './../../../common/constants/notificationType.constant';
import { UpdatePostReplyDTO } from './../dtos/updatePostReply.dto';
import { UpdatePostCommentDTO } from './../dtos/updatePostComment.dto';
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
import { VoteCommentPostDTO } from '../dtos/voteCommentPost.dto';
import { PostCommentVoteRepository } from '../repositories/postCommentVote.repository';
import { NotificationService } from 'src/modules/notifications/service/notification.service';
import { NotificationStatus } from 'src/common/constants/notificationStatus.dto';
import { NotificationReference } from 'src/common/constants/notificationRef.constant';

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
    private readonly postCommentVoteRepository: PostCommentVoteRepository,
    private readonly fileService: FileService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    /*======================================================*/
    private readonly notificationService: NotificationService,
  ) {}

  async createPost(createPostData: CreatePostDTO, ownerId: string) {
    const postData = await this.postRepository.createPost(
      createPostData,
      ownerId,
    );

    await this.postRepository.save(postData);
    await this.postRepository.update(postData.id, { dateUpdated: new Date() });

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
    await this.postRepository.update(postId, { dateUpdated: new Date() });
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
    const userFollowPost = await this.folowPostRepository.getFollowPostById(
      viewPostData.userId,
      viewPostData.postId,
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

    const postDetail = await this.getPostDetailById(viewPostData);
    if (userFollowPost) postDetail.isFollow = true;
    return postDetail;
  }

  async votePost(votePostData: VotePostDTO) {
    let sendNotification = false;
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
      sendNotification = true;
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
      sendNotification = true;
    }

    if (sendNotification) {
      await this.notificationService.createNotification({
        body: `${user.username} voted to yout post`,
        type: NoticationType.PostVote,
        refType: NotificationReference.Post,
        refId: votePostData.postId,
        userId: post.owner.id,
        status: NotificationStatus.Sent,
      });
    } else {
      await this.notificationService.removeNotification({
        body: `${user.username} voted to yout post`,
        type: NoticationType.PostVote,
        refType: NotificationReference.Post,
        refId: votePostData.postId,
        userId: post.owner.id,
        status: NotificationStatus.Sent,
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
        await this.addCommentTag(userTag, postComment.commentId);

        await this.notificationService.createNotification({
          body: `${user.username} metioned you in a comment`,
          type: NoticationType.PostComment,
          refType: NotificationReference.Comment,
          refId: postComment.commentId,
          userId: userTag,
          status: NotificationStatus.Sent,
          extendData: JSON.stringify({
            post: createData.postId,
          }),
        });
      }),
    );

    await this.notificationService.createNotification({
      body: `${user.username} comment in your post`,
      type: NoticationType.PostComment,
      refType: NotificationReference.Post,
      refId: postComment.postId,
      userId: post.owner.id,
      status: NotificationStatus.Sent,
    });

    return postComment;
  }

  async editCommentPost(
    commentId: string,
    updatePostCommentData: UpdatePostCommentDTO,
  ) {
    const userTagIds =
      await this.postCommentTagRepository.getUserTagIdByCommentId(commentId);
    const comment = await this.postCommentRepository.getCommentById(commentId);
    const user = await this.userService.getUserById(
      updatePostCommentData.userCommentId,
    );

    const userDeleteInTag = userTagIds.filter(
      (x) => !updatePostCommentData.userTag.includes(x.senderId),
    );
    const userAddNewInTag = updatePostCommentData.userTag.filter(
      (x) => !userTagIds.map((data) => data.senderId).includes(x),
    );

    Promise.all(
      userDeleteInTag.map(async (commentTag) => {
        await this.removeCommentTag(commentTag.commentTagId);

        // Remove Notification
        await this.notificationService.removeNotification({
          body: `${user.username} metioned you in a comment`,
          type: NoticationType.PostComment,
          refType: NotificationReference.Comment,
          refId: postComment.commentId,
          userId: commentTag.commentTagId,
          status: NotificationStatus.Sent,
          extendData: JSON.stringify({
            post: updatePostCommentData.postId,
          }),
        });
      }),
    );

    Promise.all(
      userAddNewInTag.map(async (userTag) => {
        await this.addCommentTag(userTag, commentId);

        await this.notificationService.createNotification({
          body: `${user.username} metioned you in a comment`,
          type: NoticationType.PostComment,
          refType: NotificationReference.Comment,
          refId: postComment.commentId,
          userId: userTag,
          status: NotificationStatus.Sent,
          extendData: JSON.stringify({
            post: updatePostCommentData.postId,
          }),
        });
      }),
    );

    const postComment = await this.postCommentRepository.updateComment(
      commentId,
      {
        ...comment,
        postId: updatePostCommentData.postId,
        senderId: updatePostCommentData.userCommentId,
        content: updatePostCommentData.commentContent,
      },
    );
    await this.postCommentRepository.save(postComment);

    return await this.getCommentById(commentId);
  }

  async getCommentById(commentId: string) {
    const comment = await this.postCommentRepository.getCommentById(commentId);
    return comment ? getCommentWithImageLink(comment) : null;
  }

  async voteCommentPost(voteCommentPostData: VoteCommentPostDTO) {
    let sendNotification = false;
    const user = await this.userService.getUserById(voteCommentPostData.userId);
    const comment = await this.getCommentById(
      voteCommentPostData.postCommentId,
    );
    const upVote = voteCommentPostData.type === true ? 1 : -1;

    if (!user) {
      throw new NotFoundException(
        `Can not found user with id: ${voteCommentPostData.userId}`,
      );
    } else if (!comment) {
      throw new NotFoundException(
        `Can not find post with id: ${voteCommentPostData.postCommentId}`,
      );
    }

    const votePostComment =
      await this.postCommentVoteRepository.getVotePostCommentById(
        voteCommentPostData.userId,
        voteCommentPostData.postCommentId,
      );

    if (!votePostComment) {
      const votePost = await this.postCommentVoteRepository.votePost(
        voteCommentPostData,
      );
      await this.postCommentVoteRepository.save(votePost);
      await this.postCommentRepository.update(
        voteCommentPostData.postCommentId,
        {
          vote: comment.vote + upVote,
        },
      );

      sendNotification = true;
    } else if (votePostComment.type === votePostComment.type) {
      await this.postCommentVoteRepository.deleteVote(
        voteCommentPostData.userId,
        voteCommentPostData.postCommentId,
      );

      await this.postCommentRepository.update(
        voteCommentPostData.postCommentId,
        {
          vote: comment.vote - upVote,
        },
      );
    } else {
      await this.postCommentVoteRepository.updateVotePost(voteCommentPostData);
      await this.postCommentRepository.update(
        voteCommentPostData.postCommentId,
        {
          vote: comment.vote + 2 * upVote,
        },
      );
      sendNotification = true;
    }

    if (sendNotification) {
      await this.notificationService.createNotification({
        body: `${user.username} voted to yout comment`,
        type: NoticationType.PostCommentVote,
        refType: NotificationReference.Comment,
        refId: voteCommentPostData.postCommentId,
        userId: voteCommentPostData.userId,
        status: NotificationStatus.Sent,
      });
    } else {
      await this.notificationService.removeNotification({
        body: `${user.username} voted to yout comment`,
        type: NoticationType.PostCommentVote,
        refType: NotificationReference.Comment,
        refId: voteCommentPostData.postCommentId,
        userId: voteCommentPostData.userId,
        status: NotificationStatus.Sent,
      });
    }
    return true;
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
        await this.addReplyTag(userTag, postReply.replyId);

        await this.notificationService.createNotification({
          body: `${user.username} metioned you in a comment`,
          type: NoticationType.PostReply,
          refType: NotificationReference.Reply,
          refId: postReply.replyId,
          userId: userTag,
          status: NotificationStatus.Sent,
          extendData: JSON.stringify({
            post: comment.postId,
            comment: postReply.commentId,
          }),
        });
      }),
    );

    await this.notificationService.createNotification({
      body: `${user.username} reply you in a comment`,
      type: NoticationType.PostReply,
      refType: NotificationReference.Reply,
      refId: postReply.replyId,
      userId: createData.userCommentId,
      status: NotificationStatus.Sent,
      extendData: JSON.stringify({
        post: comment.postId,
        comment: postReply.commentId,
      }),
    });
    return postReply;
  }

  async editReplyPost(
    replyId: string,
    updatePostReplyData: UpdatePostReplyDTO,
  ) {
    const user = await this.userService.getUserById(
      updatePostReplyData.userCommentId,
    );
    const comment = await this.getCommentById(updatePostReplyData.commentId);
    const userTagIds = await this.postReplyTagRepository.getUserTagIdByReplyId(
      replyId,
    );
    const reply = await this.postReplyRepository.getReplyById(replyId);

    const userDeleteInTag = userTagIds.filter(
      (x) => !updatePostReplyData.userTag.includes(x.senderId),
    );
    const userAddNewInTag = updatePostReplyData.userTag.filter(
      (x) => !userTagIds.map((data) => data.senderId).includes(x),
    );

    Promise.all(
      userDeleteInTag.map(async (replyTag) => {
        await this.removeReplyTag(replyTag.replyTagId);

        // Remove Notification
      }),
    );

    Promise.all(
      userAddNewInTag.map(async (userTag) => {
        await this.addReplyTag(userTag, replyId);

        await this.notificationService.createNotification({
          body: `${user.username} metioned you in a comment`,
          type: NoticationType.PostReply,
          refType: NotificationReference.Reply,
          refId: postReply.replyId,
          userId: userTag,
          status: NotificationStatus.Sent,
          extendData: JSON.stringify({
            post: comment.postId,
            comment: postReply.commentId,
          }),
        });
      }),
    );

    const postReply = await this.postReplyRepository.updateReply(replyId, {
      ...reply,
      commentId: updatePostReplyData.commentId,
      senderId: updatePostReplyData.userCommentId,
      content: updatePostReplyData.replyContent,
    });
    await this.postReplyRepository.save(postReply);
  }

  async getReplyById(replyId: string) {
    const reply = await this.postReplyRepository.getReplyById(replyId);
    return reply ? getReplyWithImageLink(reply) : null;
  }

  async getAllPost(page: PostPage, dataSearch: string) {
    const listPosts = await this.postRepository.getAllPost(page, dataSearch);
    return listPosts;
  }

  async getAllPostNeedApprove(page: PostPage, dataSearch: string) {
    const listPosts = await this.postRepository.getAllPostNeedApprove(
      page,
      dataSearch,
    );
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

  async getAllPostWithUser(
    userId: string,
    page: PostPage,
    ownerRequest = false,
  ) {
    const listPosts = await this.postRepository.getAllPublicPostByUser(
      userId,
      page,
      ownerRequest,
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
    if (!post) {
      throw new NotFoundException(`Not found post with id: ${postId}`);
    }
    let thumbnailLink = post.thumbnailLink;
    if (thumbnailLink) {
      const part = thumbnailLink.split('/');
      thumbnailLink = part[part.length - 1];
    }

    if (thumbnailLink) {
      const oldImage = await this.fileService.getFileById(thumbnailLink);

      if (await CompareTwoImage(oldImage.path, fileData.path)) return;
      else await this.addThumbnail(postId, fileData);
    } else {
      await this.addThumbnail(postId, fileData);
    }
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

  async editPostCommentImage(commentId: string, fileData: FileDTO) {
    const post = await this.getCommentById(commentId);
    let imageLink = post.imageLink;
    if (imageLink) {
      const part = imageLink.split('/');
      imageLink = part[part.length - 1];
    }

    if (imageLink) {
      const oldImage = await this.fileService.getFileById(imageLink);
      if (await CompareTwoImage(oldImage.path, fileData.path)) return;
      else await this.addPostCommentImage(commentId, fileData);
    } else {
      await this.addPostCommentImage(commentId, fileData);
    }
  }

  async editPostReplyImage(replyId: string, fileData: FileDTO) {
    const post = await this.getReplyById(replyId);
    let imageLink = post.imageLink;
    if (imageLink) {
      const part = imageLink.split('/');
      imageLink = part[part.length - 1];
    }

    if (imageLink) {
      const oldImage = await this.fileService.getFileById(imageLink);
      if (await CompareTwoImage(oldImage.path, fileData.path)) return;
      else await this.addPostCommentImage(replyId, fileData);
    } else {
      await this.addPostCommentImage(replyId, fileData);
    }
  }

  private async addCommentTag(userTag: string, commentId: string) {
    try {
      const userOnTag = await this.userService.getUserById(userTag);
      if (!userOnTag) {
        throw new NotFoundException(`Can not found user with id: ${userTag}`);
      }

      const postCommentTag =
        await this.postCommentTagRepository.createCommentTag({
          senderId: userTag,
          commentId: commentId,
        });

      await this.postCommentTagRepository.save(postCommentTag);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  private async removeCommentTag(commentTagId: string) {
    await this.postCommentTagRepository.removeCommentTag(commentTagId);
  }

  private async addReplyTag(userTag: string, replyId: string) {
    try {
      const userOnTag = await this.userService.getUserById(userTag);
      if (!userOnTag) {
        throw new NotFoundException(`Can not found user with id: ${userTag}`);
      }

      const postReplyTag = await this.postReplyTagRepository.createReplyTag({
        senderId: userTag,
        replyId: replyId,
      });

      await this.postReplyTagRepository.save(postReplyTag);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  private async removeReplyTag(replyId: string) {
    await this.postReplyTagRepository.removeReplyTag(replyId);
  }
}
