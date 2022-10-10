import { Post } from './../../posts/entities/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ICreated } from 'src/common/model/ICreated.interface';
import { IModified } from 'src/common/model/IModified.interface';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import { Gender } from 'src/common/constants/gender.constant';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { UserFollow } from './userFollow.entity';
import { File } from '../../files/entities/file.entity';

@Entity('User')
export class User implements ICreated, IModified, IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column()
  @Index()
  public email: string;

  @Column()
  public username: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({ default: '' })
  public shortInfo: string;

  @Column({ nullable: true })
  public phoneNumber: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.Unknown,
  })
  public gender: Gender;

  @CreateDateColumn()
  @Exclude()
  public dateCreated: Date;

  @UpdateDateColumn()
  @Exclude()
  public dateModified: Date;

  @Column({ default: 'false' })
  @Index()
  @Exclude()
  public deleted: boolean;

  @Column({ nullable: true })
  @Index()
  @Exclude()
  public token: string;

  @Column({ nullable: true })
  @Exclude()
  public dateExpires: Date;

  @Column({ default: 'false' })
  @Exclude()
  public isActive: boolean;

  @Column({ nullable: true })
  public avatarId?: string;

  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken: string;

  @DeleteDateColumn()
  @Exclude()
  public dateDeleted: Date;

  @JoinColumn({ name: 'avatarId' })
  @OneToOne(() => File, { nullable: true })
  public avatar?: File;

  @ManyToOne(() => Role)
  @JoinColumn()
  public role: Role;

  @OneToMany(
    () => UserFollow,
    (userFollow: UserFollow) => userFollow.userFollow,
  )
  public userFollows: User[];

  @OneToMany(() => UserFollow, (userFollow: UserFollow) => userFollow.follower)
  public followers: User[];

  @OneToMany(() => Post, (post: Post) => post.owner)
  public posts: Post[];
}
