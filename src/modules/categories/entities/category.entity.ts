import { Post } from './../../posts/entities/post.entity';
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Tree,
  TreeParent,
  TreeChildren,
  OneToMany,
} from 'typeorm';

@Entity('Category')
@Tree('closure-table')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  @Index()
  public categoryName: string;

  @TreeParent()
  public rootCategory: Category;

  @TreeChildren()
  public childCategory: Category[];

  @OneToMany(() => Post, (post: Post) => post.category)
  public posts: Post[];
}
