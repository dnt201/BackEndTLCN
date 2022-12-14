import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/users.repository';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './controllers/user.controller';
import { RoleRepository } from './repositories/roles.repositoty';
import { RoleService } from './services/roles.service';
import { Role } from './entities/role.entity';
import { RoleController } from './controllers/role.controller';
import { Permission } from './entities/permission.entity';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionService } from './services/permissions.service';
import { RolePermission } from './entities/role_permission.entity';
import { RolePermissionRepository } from './repositories/rolePermission.repository';
import { PermissionsController } from './controllers/permission.controller';
import { EmailModule } from '../email/email.module';
import { UserFollowRepository } from './repositories/userFollow.repository';
import { FileModule } from '../files/file.module';
import { SettingModule } from '../settings/setting.module';
import { PostModule } from '../posts/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, RolePermission]),
    ConfigModule,
    EmailModule,
    FileModule,
    forwardRef(() => SettingModule),
    forwardRef(() => PostModule),
  ],
  providers: [
    UsersService,
    RoleService,
    PermissionService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    RolePermissionRepository,
    UserFollowRepository,
  ],
  controllers: [UsersController, RoleController, PermissionsController],
  exports: [UsersService, RoleService, PermissionService],
})
export class UsersModule {}
