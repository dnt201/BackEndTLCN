import { Post } from 'src/modules/posts/entities/post.entity';
import { PostComment } from 'src/modules/posts/entities/postComment.entity';
import { PostReply } from 'src/modules/posts/entities/postReply.entity';
import { PostTag } from 'src/modules/posts/entities/postTag.entity';
import { User } from 'src/modules/users/entities/user.entity';

export class UserWithMoreInfo extends User {
  posts: Post[];
  follower: number;
  following: number;
  isFollowing?: boolean;
}

export function getUserWithImageLink(user: UserWithMoreInfo | User) {
  const data = {
    ...user,
    dateCreated: undefined,
    dateModified: undefined,
    dateDeleted: undefined,
    password: undefined,
    deleted: undefined,
    token: undefined,
    dateExpires: undefined,
    isActive: undefined,
    avatarId: undefined,
    currentHashedRefreshToken: undefined,
    avatarLink: user.avatarId
      ? `http://localhost:3000/file/${user.avatarId}`
      : null,
  };
  const listPost = data?.posts?.map((post) => {
    return {
      ...post,
      content: undefined,
      isPublic: undefined,
      deleted: undefined,
      dateCreated: undefined,
      dateDeleted: undefined,
    };
  });
  return { ...data, posts: listPost };
}

export function getPostTagWithThumbnailLink(postTag: PostTag) {
  return {
    ...postTag,
    thumbnailId: undefined,
    thumbnailLink: postTag.thumbnailId
      ? `http://localhost:3000/file/${postTag.thumbnailId}`
      : null,
  };
}

export function getPostWithThumbnailLink(post: Post) {
  return {
    ...post,
    deleted: undefined,
    dateCreated: undefined,
    dateModified: undefined,
    dateDeleted: undefined,
    thumbnailId: undefined,
    thumbnailLink: post?.thumbnailId
      ? `http://localhost:3000/file/${post.thumbnailId}`
      : null,
  };
}

export function getCommentWithImageLink(comment: PostComment) {
  return {
    ...comment,
    imageId: undefined,
    imageLink: comment.imageId
      ? `http://localhost:3000/file/${comment.imageId}`
      : null,
  };
}

export function getReplyWithImageLink(reply: PostReply) {
  return {
    ...reply,
    imageId: undefined,
    imageLink: reply.imageId
      ? `http://localhost:3000/file/${reply.imageId}`
      : null,
  };
}
