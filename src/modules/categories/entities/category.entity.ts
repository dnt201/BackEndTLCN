import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Tree,
  TreeParent,
  TreeChildren,
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
}
