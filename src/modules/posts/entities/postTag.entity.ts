import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

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

  @ManyToMany(() => Post, (post: Post) => post.tags)
  public posts: Post[];
}
