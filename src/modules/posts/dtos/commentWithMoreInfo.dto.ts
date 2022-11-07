import { User } from 'src/modules/users/entities/user.entity';
import { PostCommentTag } from '../entities/postCommentTag.entity';

export class CommentWithMoreInfo {
  commentId: string;
  content: string;
  countReply: number;
  dateModified: Date;
  sender: {
    id: string;
    username: string;
    avatarLink: string;
  };
  commentTag: UserFewerDetail[];
}

export class CommentWithMoreInfoDTO {
  commentId: string;
  content: string;
  countReply: number;
  dateModified: Date;
  sender: User;
  postCommentTags: PostCommentTag[];
}

export class UserFewerDetail {
  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
  id: string;
  username: string;
}
