import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../categories/category.module';
import { UsersModule } from '../users/users.module';
import { PostController } from './controllers/post.controller';
import { PostTagController } from './controllers/postTag.controller';
import { Post } from './entities/post.entity';
import { PostComment } from './entities/postComment.entity';
import { PostCommentTag } from './entities/postCommentTag.entity';
import { PostTag } from './entities/postTag.entity';
import { PostVote } from './entities/postVote.entity';
import { PostRepository } from './repositories/post.repository';
import { PostCommentRepository } from './repositories/postComment.repository';
import { PostCommentTagRepository } from './repositories/postCommentTag.repository';
import { PostTagRepository } from './repositories/postTag.repository';
import { PostVoteRepository } from './repositories/postVote.repository';
import { PostService } from './services/post.service';
import { PostTagService } from './services/postTag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostTag,
      Post,
      PostVote,
      PostComment,
      PostCommentTag,
    ]),
    UsersModule,
    CategoryModule,
  ],
  providers: [
    PostTagService,
    PostTagRepository,
    PostRepository,
    PostVoteRepository,
    PostCommentRepository,
    PostCommentTagRepository,
    PostService,
  ],
  controllers: [PostTagController, PostController],
  exports: [PostTagService, PostService],
})
export class PostModule {}
