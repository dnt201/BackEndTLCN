import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('UserFollow')
export class UserFollow {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  userFollowId: string;

  @ManyToOne(() => User, (user: User) => user.followers)
  @JoinColumn({ name: 'userId' })
  public follower: User;

  @ManyToOne(() => User, (user: User) => user.userFollows)
  @JoinColumn({ name: 'userFollowId' })
  public userFollow: User;
}
