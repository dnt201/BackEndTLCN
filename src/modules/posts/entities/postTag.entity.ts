import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { File } from 'src/modules/files/entities/file.entity';

@Entity('PostTag')
export class PostTag {
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
}
