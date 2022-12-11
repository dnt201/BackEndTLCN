import { User } from 'src/modules/users/entities/user.entity';
import { PostCommentTag } from '../entities/postCommentTag.entity';
import { PostReplyTag } from '../entities/postReplyTag.entity';

export class CommentWithMoreInfo {
  commentId: string;
  content: string;
  countReply: number;
  dateModified: Date;
  vote: number;
  sender: {
    id: string;
    username: string;
    avatarLink: string;
  };
  commentTag: UserFewerDetail[];
}

export class ReplyWithMoreInfo {
  replyId: string;
  content: string;
  dateModified: Date;
  sender: {
    id: string;
    username: string;
    avatarLink: string;
  };
  replyTag: UserFewerDetail[];
}

export class CommentWithMoreInfoDTO {
  commentId: string;
  content: string;
  countReply: number;
  dateModified: Date;
  vote: number;
  sender: User;
  postCommentTags: PostCommentTag[];
}

export class ReplyWithMoreInfoDTO {
  replyId: string;
  content: string;
  dateModified: Date;
  sender: User;
  postReplyTags: PostReplyTag[];
}

export class UserFewerDetail {
  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
  id: string;
  username: string;
}
