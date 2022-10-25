import { User } from 'src/modules/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('User_Follow_Post')
export class UserFollowPost {
  @PrimaryColumn()
  public postId: string;

  @PrimaryColumn()
  public userId: string;

  @ManyToOne(() => Post, (post: Post) => post.postComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  public post: Post;

  @ManyToOne(() => User, (user: User) => user.postComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
