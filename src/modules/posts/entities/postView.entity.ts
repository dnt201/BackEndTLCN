import { IModified } from 'src/common/model/IModified.interface';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('Post_View')
export class PostView implements IModified {
  @PrimaryColumn()
  postId: string;

  @PrimaryColumn()
  userId: string;

  @UpdateDateColumn()
  public dateModified: Date;

  @ManyToOne(() => Post, (post: Post) => post.postVotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  public post: Post;

  @ManyToOne(() => User, (user: User) => user.postVotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
