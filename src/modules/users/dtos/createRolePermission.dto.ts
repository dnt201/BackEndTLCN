import { IsString } from 'class-validator';

export class CreateRolePermissionDTO {
  @IsString()
  roleId: string;
  @IsString()
  permissionId: string;
}
