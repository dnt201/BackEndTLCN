import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../categories/category.module';
import { FileModule } from '../files/file.module';
import { SettingModule } from '../settings/setting.module';
import { UsersModule } from '../users/users.module';
import { PostController } from './controllers/post.controller';
import { PostTagController } from './controllers/postTag.controller';
import { UserFollowPost } from './entities/followPost.entity';
import { Post } from './entities/post.entity';
import { PostComment } from './entities/postComment.entity';
import { PostCommentTag } from './entities/postCommentTag.entity';
import { PostReply } from './entities/postReply.entity';
import { PostTag } from './entities/postTag.entity';
import { PostView } from './entities/postView.entity';
import { PostVote } from './entities/postVote.entity';
import { FollowPostRepository } from './repositories/followPost.repository';
import { PostRepository } from './repositories/post.repository';
import { PostCommentRepository } from './repositories/postComment.repository';
import { PostReplyRepository } from './repositories/postCommentReply.repository';
import { PostCommentTagRepository } from './repositories/postCommentTag.repository';
import { PostTagRepository } from './repositories/postTag.repository';
import { PostViewRepository } from './repositories/postView.repository';
import { PostVoteRepository } from './repositories/postVote.repository';
import { PostService } from './services/post.service';
import { PostTagService } from './services/postTag.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostTag,
      Post,
      PostVote,
      PostView,
      PostReply,
      PostComment,
      PostCommentTag,
      UserFollowPost,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => SettingModule),
    FileModule,
    CategoryModule,
  ],
  providers: [
    PostTagService,
    PostTagRepository,
    PostRepository,
    PostVoteRepository,
    PostViewRepository,
    PostReplyRepository,
    FollowPostRepository,
    PostCommentRepository,
    PostCommentTagRepository,
    PostService,
  ],
  controllers: [PostTagController, PostController],
  exports: [PostTagService, PostService],
})
export class PostModule {}
