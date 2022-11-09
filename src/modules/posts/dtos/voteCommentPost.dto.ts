import { IsBoolean, IsString } from 'class-validator';

export class VoteCommentPostDTO {
  @IsString()
  public userId: string;

  @IsString()
  public postCommentId: string;

  @IsBoolean()
  public type: boolean;
}
