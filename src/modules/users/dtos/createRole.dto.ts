import { IsString, Matches } from 'class-validator';

export class CreateRoleDTO {
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'Role must not have spaces',
  })
  role: string;

  @IsString()
  displayName: string;
}
