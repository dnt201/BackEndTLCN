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
}

export class CreatePostCommentInput {
  public userTag: string;
  public commentContent: string;
}

export class PostCommentDTO {
  public content: string;
  public senderId: string;
  public postId: string;
}

export class PostCommentTagDTO {
  public senderId: string;
  public commentId: string;
}
