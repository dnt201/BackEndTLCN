import { Module } from '@nestjs/common';
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

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), ConfigModule],
  providers: [UsersService, RoleService, UserRepository, RoleRepository],
  controllers: [UsersController, RoleController],
  exports: [UsersService, RoleService],
})
export class UsersModule {}
