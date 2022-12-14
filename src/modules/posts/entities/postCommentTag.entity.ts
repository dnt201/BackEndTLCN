import { ICreated } from 'src/common/model/ICreated.interface';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostComment } from './postComment.entity';

@Entity('Post_Comment_Tag')
export class PostCommentTag implements ICreated {
  @PrimaryGeneratedColumn('uuid')
  public commentTagId?: string;

  @Column()
  public senderId: string;

  @Column()
  public commentId: string;

  @CreateDateColumn()
  public dateCreated: Date;

  @ManyToOne(() => User, (user: User) => user.postCommentTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  public sender: User;

  @ManyToOne(
    () => PostComment,
    (postComment: PostComment) => postComment.postCommentTags,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'commentId' })
  public postComment: PostComment;
}
