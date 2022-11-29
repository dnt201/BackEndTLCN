import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { File } from 'src/modules/files/entities/file.entity';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import { Exclude } from 'class-transformer';

@Entity('PostTag')
export class PostTag implements IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ unique: true })
  public postTagName: string;

  @Column({ unique: true })
  public displayName: string;

  @Column({ unique: true })
  public colorCode: string;

  @Column({ nullable: true })
  public thumbnailId?: string;

  @ManyToMany(() => Post, (post: Post) => post.tags)
  public posts: Post[];

  @JoinColumn({ name: 'thumbnailId' })
  @OneToOne(() => File, { nullable: true })
  public thumbnail?: File;

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Exclude()
  @DeleteDateColumn()
  dateDeleted: Date;
}
