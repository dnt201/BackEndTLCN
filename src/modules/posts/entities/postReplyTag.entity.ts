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
import { PostReply } from './postReply.entity';

@Entity('Post_Reply_Tag')
export class PostReplyTag implements ICreated {
  @PrimaryGeneratedColumn('uuid')
  public replyTagId?: string;

  @Column()
  public senderId: string;

  @Column()
  public replyId: string;

  @CreateDateColumn()
  dateCreated: Date;

  @ManyToOne(() => User, (user: User) => user.postReplyTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  public sender: User;

  @ManyToOne(
    () => PostReply,
    (postReply: PostReply) => postReply.postReplyTags,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'replyId' })
  public postReply: PostReply;
}
