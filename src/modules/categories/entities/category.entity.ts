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
  DeleteDateColumn,
} from 'typeorm';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import { Exclude } from 'class-transformer';

@Entity('Category')
@Tree('closure-table')
export class Category implements IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  @Index()
  public categoryName: string;

  @TreeParent()
  public rootCategory: Category;

  @TreeChildren()
  public childCategory: Category[];

  @Exclude()
  @Column({ default: false })
  deleted: boolean;

  @Exclude()
  @DeleteDateColumn()
  dateDeleted: Date;

  @OneToMany(() => Post, (post: Post) => post.category)
  public posts: Post[];
}
