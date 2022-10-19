import { ICreated } from 'src/common/model/ICreated.interface';
import { User } from 'src/modules/users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Post_Comment_Tag')
export class PostCommentTag implements ICreated {
  @PrimaryGeneratedColumn('uuid')
  public commentTagId?: string;

  @PrimaryColumn()
  public userId: string;

  @PrimaryColumn()
  public commentId: string;

  @PrimaryColumn()
  public typeOfComment: string;

  @CreateDateColumn()
  public dateCreated: Date;

  @ManyToOne(() => User, (user: User) => user.postCommentTags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  public user: User;
}
