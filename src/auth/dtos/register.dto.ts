import { IsEmail, Matches, MaxLength, MinLength } from 'class-validator';
export class RegisterDTO {
  @IsEmail()
  email: string;

  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/, {
    message:
      'Password have a minimum of 8 characters and contain at least one upper case letter, one lower case letter, one number, and one special character',
  })
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
