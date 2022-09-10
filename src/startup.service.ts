import * as bcrypt from 'bcrypt';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateRoleDTO } from './modules/users/dtos/createRole.dto';
import { RoleService } from './modules/users/services/roles.service';
import { UsersService } from './modules/users/services/users.service';
import { PermissionService } from './modules/users/services/permissions.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly usersService: UsersService,
    private readonly permissionService: PermissionService,
    private readonly configService: ConfigService,
  ) {}
  async onModuleInit() {
    await this.createDefaultRole();
    await this.createDefaultUser();
    await this.createAdminPermission();
    await this.createDefaultRolePermission();
  }

  private async createDefaultRole() {
    const adminRole: CreateRoleDTO = {
      role: this.configService.get('ADMIN_ROLE'),
      displayName: this.configService.get('ADMIN_ROLE'),
    };
    if (!(await this.roleService.getRoleByDisplayName(adminRole.displayName)))
      await this.roleService.createRole(adminRole);

    const userRole: CreateRoleDTO = {
      role: this.configService.get('USER_ROLE'),
      displayName: this.configService.get('USER_ROLE'),
    };
    if (!(await this.roleService.getRoleByDisplayName(userRole.displayName)))
      await this.roleService.createRole(userRole);
    this.logger.log('Default Role Create Successfully');
  }

  private async createDefaultUser() {
    const defaultPassword = await this.configService.get('ADMIN_PASSWORD');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

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
    const defaultAdminView = await this.configService.get(
      'ADMIN_VIEW_PERMISSION',
    );

    const adminPermission = {
      permission: defaultAdminView,
      displayName: defaultAdminView,
    };

    const existedPermission =
      await this.permissionService.getPermissionByDisplayName(
        adminPermission.displayName,
      );

    if (!existedPermission)
      await this.permissionService.createPermission(adminPermission);
    this.logger.log('Default Permission Create Successfully');
  }

  private async createDefaultRolePermission() {
    const defaultAdminView = await this.configService.get(
      'ADMIN_VIEW_PERMISSION',
    );
    const adminRole = await this.configService.get('ADMIN_ROLE');
    const role = await this.roleService.getRoleByDisplayName(adminRole);
    const roleWithPermission = await this.roleService.getPermissionByRole(
      role.id,
    );
    const permission = await this.permissionService.getPermissionByDisplayName(
      defaultAdminView,
    );

    const listPermission = roleWithPermission.permission.map((permission) => {
      return permission.id;
    });

    if (listPermission.indexOf(permission.id) === -1) {
      await this.roleService.addPermissionToRole(role.id, permission.id);
    }
    this.logger.log('Default Role-Permission Create Successfully');
  }
}
