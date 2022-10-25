import { IsString } from 'class-validator';

export class FollowPostDTO {
  @IsString()
  public userId: string;

  @IsString()
  public postId: string;
}
