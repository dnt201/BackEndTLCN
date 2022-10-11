import { IsBoolean, IsString } from 'class-validator';

export class VotePostDTO {
  @IsString()
  public userId: string;

  @IsString()
  public postId: string;

  @IsBoolean()
  public type: boolean;
}
