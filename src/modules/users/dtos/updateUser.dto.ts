import { Gender } from 'src/common/constants/gender.constant';

export class UpdateUserDTO {
  username: string;
  email: string;
  phoneNumber: string;
  shortInfo: string;
  gender: Gender;
}
