import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';

import { DatabaseModule } from './config/database/database.config.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppService } from './startup.service';
import { PostModule } from './modules/posts/post.module';
import { SettingModule } from './modules/settings/setting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),

        PORT: Joi.number(),

        USER_ROLE: Joi.string().required(),
        ADMIN_ROLE: Joi.string().required(),

        ADMIN_EMAIL: Joi.string().required(),
        ADMIN_USERNAME: Joi.string().required(),
        ADMIN_PASSWORD: Joi.string().required(),

        ADMIN_VIEW_PERMISSION: Joi.string().required(),

        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),

        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    PostModule,
    SettingModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
