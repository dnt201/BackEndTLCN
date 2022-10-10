import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../categories/category.module';
import { UsersModule } from '../users/users.module';
import { PostController } from './controllers/post.controller';
import { PostTagController } from './controllers/postTag.controller';
import { Post } from './entities/post.entity';
import { PostTag } from './entities/postTag.entity';
import { PostRepository } from './repositories/post.repository';
import { PostTagRepository } from './repositories/postTag.repository';
import { PostService } from './services/post.service';
import { PostTagService } from './services/postTag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostTag, Post]),
    UsersModule,
    CategoryModule,
  ],
  providers: [PostTagService, PostTagRepository, PostService, PostRepository],
  controllers: [PostTagController, PostController],
  exports: [PostTagService, PostService],
})
export class PostModule {}
