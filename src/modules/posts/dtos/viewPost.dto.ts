import { IsString } from 'class-validator';

export class ViewPostDTO {
  @IsString()
  public userId?: string;

  @IsString()
  public postId?: string;
}
