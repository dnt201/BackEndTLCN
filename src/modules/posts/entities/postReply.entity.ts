import { IModified } from 'src/common/model/IModified.interface';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostComment } from './postComment.entity';

@Entity('Post_Reply')
export class PostReply implements IModified {
  @PrimaryGeneratedColumn('uuid')
  public replyId?: string;

  @Column()
  commentId: string;

  @Column()
  userId: string;

  @Column()
  content: string;

  @UpdateDateColumn()
  public dateModified: Date;

  @ManyToOne(
    () => PostComment,
    (postComment: PostComment) => postComment.postReplies,
  )
  @JoinColumn({ name: 'commentId' })
  public postComment: PostComment;

  @ManyToOne(() => User, (user: User) => user.postReplies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
