import { IModified } from 'src/common/model/IModified.interface';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostComment } from './postComment.entity';

@Entity('PostComment_Vote')
export class PostCommentVote implements IModified {
  @PrimaryColumn()
  postCommentId: string;

  @PrimaryColumn()
  userId: string;

  @Column()
  type: boolean;

  @UpdateDateColumn()
  public dateModified: Date;

  @ManyToOne(
    () => PostComment,
    (postComment: PostComment) => postComment.postCommentVotes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'postCommentId' })
  public postComment: PostComment;

  @ManyToOne(() => User, (user: User) => user.postCommentVotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
