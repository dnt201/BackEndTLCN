import { IsString } from 'class-validator';

export class UserFollowUserDTO {
  @IsString()
  userFollowId: string;
}
