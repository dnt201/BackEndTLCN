import { IsEmail, IsString } from 'class-validator';
import { Gender } from 'src/common/constants/gender.constant';

export class UpdateUserDTO {
  @IsString()
  username: string;
  @IsEmail()
  email: string;
  @IsString()
  shortInfo: string;
  @IsString()
  gender: Gender;
}
