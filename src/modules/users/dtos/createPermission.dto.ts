import { IsString, Matches } from 'class-validator';

export class CreatePermissionDTO {
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'Permission must not have spaces, please use - instead of space',
  })
  permission: string;

  @IsString()
  displayName: string;
}
