import { Matches, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDTO {
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/, {
    message:
      'Old password have a minimum of 8 characters and contain at least one upper case letter, one lower case letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(50)
  oldPassword: string;

  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/, {
    message:
      'New password have a minimum of 8 characters and contain at least one upper case letter, one lower case letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(50)
  newPassword: string;

  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/, {
    message:
      'Confirm password have a minimum of 8 characters and contain at least one upper case letter, one lower case letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(50)
  confirmPassword: string;
}
