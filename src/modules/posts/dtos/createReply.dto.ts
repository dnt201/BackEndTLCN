import { IsOptional, IsString } from 'class-validator';

export class CreatePostReplyDTO {
  @IsOptional()
  @IsString({ each: true })
  public userTag: string[];

  @IsString()
  public replyContent: string;

  @IsOptional()
  @IsString()
  public userCommentId: string;

  @IsOptional()
  @IsString()
  public commentId: string;
}

export class CreatePostReplyInput {
  public replyContent: string;
  public userTag: string;
}

export class PostReplyDTO {
  public senderId: string;
  public commentId: string;
  public content: string;
}

export class PostReplyTagDTO {
  public senderId: string;
  public replyId: string;
}
