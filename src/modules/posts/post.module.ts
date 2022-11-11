import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from './../notifications/notification.module';
import { PostCommentVoteRepository } from './repositories/postCommentVote.repository';
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
import { PostReplyTag } from './entities/postReplyTag.entity';
import { PostTag } from './entities/postTag.entity';
import { PostView } from './entities/postView.entity';
import { PostVote } from './entities/postVote.entity';
import { FollowPostRepository } from './repositories/followPost.repository';
import { PostRepository } from './repositories/post.repository';
import { PostCommentRepository } from './repositories/postComment.repository';
import { PostReplyRepository } from './repositories/postCommentReply.repository';
import { PostCommentTagRepository } from './repositories/postCommentTag.repository';
import { PostReplyTagRepository } from './repositories/postReplyTag.repository';
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
      PostReplyTag,
      PostCommentTag,
      UserFollowPost,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    forwardRef(() => SettingModule),
    forwardRef(() => NotificationModule),
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
    PostReplyTagRepository,
    PostCommentTagRepository,
    PostCommentVoteRepository,
    PostService,
  ],
  controllers: [PostTagController, PostController],
  exports: [PostTagService, PostService],
})
export class PostModule {}
