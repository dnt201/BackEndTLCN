import * as bcrypt from 'bcrypt';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateRoleDTO } from './modules/users/dtos/createRole.dto';
import { RoleService } from './modules/users/services/roles.service';
import { UsersService } from './modules/users/services/users.service';
import { PermissionService } from './modules/users/services/permissions.service';
import {
  Permission_Permission,
  Role_Permission,
  User_Permission,
} from './modules/users/permission/permission';
import { ChangeEnumToArray } from './utils/changeEnumToArray';
import { CreatePermissionDTO } from './modules/users/dtos/createPermission.dto';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  user: CreateRoleDTO;
  admin: CreateRoleDTO;
  defaultPassword: string;
  defaultAdminView: string;
  adminPermission: CreatePermissionDTO[];

  constructor(
    private readonly roleService: RoleService,
    private readonly usersService: UsersService,
    private readonly permissionService: PermissionService,
    private readonly configService: ConfigService,
  ) {
    this.defaultPassword = this.configService.get('ADMIN_PASSWORD');
    this.defaultAdminView = this.configService.get('ADMIN_VIEW_PERMISSION');
    this.admin = {
      role: this.configService.get('ADMIN_ROLE'),
      displayName: this.configService.get('ADMIN_ROLE'),
    };
    this.user = {
      role: this.configService.get('USER_ROLE'),
      displayName: this.configService.get('USER_ROLE'),
    };
    this.adminPermission = [
      {
        permission: this.defaultAdminView,
        displayName: this.defaultAdminView,
      },
      ...ChangeEnumToArray(Role_Permission),
      ...ChangeEnumToArray(Permission_Permission),
      ...ChangeEnumToArray(User_Permission),
    ];
  }
  async onModuleInit() {
    await this.createDefaultRole();
    await this.createDefaultUser();
    await this.createAdminPermission();
    await this.createDefaultRolePermission();
  }

  private async createDefaultRole() {
    if (!(await this.roleService.getRoleByDisplayName(this.admin.displayName)))
      await this.roleService.createRole(this.admin);

    if (!(await this.roleService.getRoleByDisplayName(this.user.displayName)))
      await this.roleService.createRole(this.user);
    this.logger.log('Default Role Create Successfully');
  }

  private async createDefaultUser() {
    const hashedPassword = await bcrypt.hash(this.defaultPassword, 10);

    const adminAccount = {
      email: this.configService.get('ADMIN_EMAIL'),
      password: hashedPassword,
    };

    const existUser = await this.usersService.getUserByEmail(
      adminAccount.email,
    );

    if (!existUser) await this.usersService.createUser(adminAccount);
    this.logger.log('Default User Create Successfully');
  }

  private async createAdminPermission() {
    await Promise.all(
      this.adminPermission.map(async (permission) => {
        const existedPermission =
          await this.permissionService.getPermissionByDisplayName(
            permission.displayName,
          );

        if (!existedPermission)
          await this.permissionService.createPermission(permission);
      }),
    );
    this.logger.log('Default Permission Create Successfully');
  }

  private async createDefaultRolePermission() {
    const role = await this.roleService.getRoleByDisplayName(
      this.admin.displayName,
    );
    const roleWithPermission = await this.roleService.getPermissionByRole(
      role.id,
    );

    const listPermission = await Promise.all(
      this.adminPermission.map(async (permission) => {
        const perm = await this.permissionService.getPermissionByDisplayName(
          permission.displayName,
        );
        return perm;
      }),
    );

    await Promise.all(
      listPermission.map(async (newPermission) => {
        const listPermission = roleWithPermission.permission.map(
          (permission) => {
            return permission.id;
          },
        );

        if (listPermission.indexOf(newPermission.id) === -1) {
          await this.roleService.addPermissionToRole(role.id, newPermission.id);
        }
      }),
    );
    this.logger.log('Default Role-Permission Create Successfully');
  }
}
