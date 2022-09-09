import * as bcrypt from 'bcrypt';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateRoleDTO } from './modules/users/dtos/createRole.dto';
import { RoleService } from './modules/users/services/roles.service';
import { UsersService } from './modules/users/services/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}
  async onModuleInit() {
    await this.createDefaultRole();
    await this.createDefaultUser();
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
}
