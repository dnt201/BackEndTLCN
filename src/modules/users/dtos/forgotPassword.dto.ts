import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ForgotPasswordFormDTO {
  @IsEmail()
  email: string;
}

export class ValidatePasswordTokenDTO {
  @IsString()
  token: string;
}

export class ForgotPasswordDTO {
  @IsString()
  token: string;
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/, {
    message:
      'Password have a minimum of 8 characters and contain at least one upper case letter, one lower case letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/, {
    message:
      'Confirm Password have a minimum of 8 characters and contain at least one upper case letter, one lower case letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(50)
  confirmPassword: string;
}
