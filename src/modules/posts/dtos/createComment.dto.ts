import { IsOptional, IsString } from 'class-validator';

export class CreatePostCommentDTO {
  @IsOptional()
  @IsString({ each: true })
  public userTag: string[];

  @IsString()
  public commentContent: string;

  @IsOptional()
  @IsString()
  public userCommentId: string;

  @IsOptional()
  @IsString()
  public postId: string;

  @IsOptional()
  @IsString()
  public commentId: string;
}

export class PostCommentDTO {
  public content: string;
  public userId: string;
  public postId: string;
}

export class PostCommentTagDTO {
  public userId: string;
  public commentId: string;
  public typeOfComment: string;
}

export class PostReplyDTO {
  public userId: string;
  public commentId: string;
  public content: string;
}
