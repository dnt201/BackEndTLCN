import { IModified } from 'src/common/model/IModified.interface';
import { User } from 'src/modules/users/entities/user.entity';
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
import { PostComment } from './postComment.entity';
import { PostReplyTag } from './postReplyTag.entity';
import { File } from '../../files/entities/file.entity';

@Entity('Post_Reply')
export class PostReply implements IModified {
  @PrimaryGeneratedColumn('uuid')
  public replyId: string;

  @Column()
  commentId: string;

  @Column()
  senderId: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  public imageId?: string;

  @UpdateDateColumn()
  public dateModified: Date;

  @ManyToOne(
    () => PostComment,
    (postComment: PostComment) => postComment.postReplies,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'commentId' })
  public postComment: PostComment;

  @ManyToOne(() => User, (user: User) => user.postReplies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  public sender: User;

  @OneToMany(
    () => PostReplyTag,
    (postReplyTag: PostReplyTag) => postReplyTag.postReply,
  )
  public postReplyTags: PostReplyTag[];

  @JoinColumn({ name: 'imageId' })
  @OneToOne(() => File, { nullable: true })
  public image?: File;
}
