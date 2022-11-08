import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { IModified } from 'src/common/model/IModified.interface';
import { User } from 'src/modules/users/entities/user.entity';
import { PostReply } from './postReply.entity';
import { PostCommentTag } from './postCommentTag.entity';
import { File } from '../../files/entities/file.entity';

@Entity('Post_Comment')
export class PostComment implements IModified {
  @PrimaryGeneratedColumn('uuid')
  public commentId: string;

  @Column()
  postId: string;

  @Column()
  senderId: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  public imageId?: string;

  @UpdateDateColumn()
  public dateModified: Date;

  @ManyToOne(() => Post, (post: Post) => post.postComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  public post: Post;

  @ManyToOne(() => User, (user: User) => user.postComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  public sender: User;

  @OneToMany(() => PostReply, (postReply: PostReply) => postReply.postComment)
  public postReplies: PostReply[];

  @OneToMany(
    () => PostCommentTag,
    (postCommentTag: PostCommentTag) => postCommentTag.postComment,
  )
  public postCommentTags: PostCommentTag[];

  @JoinColumn({ name: 'imageId' })
  @OneToOne(() => File, { nullable: true })
  public image?: File;

  countReply: number;
}
