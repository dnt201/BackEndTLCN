import { Category } from './../../categories/entities/category.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import { IModified } from 'src/common/model/IModified.interface';
import { ICreated } from 'src/common/model/ICreated.interface';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostTag } from './postTag.entity';

@Entity('Posts')
export class Post implements ICreated, IModified, IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column()
  public title: string;

  @Column()
  public content: string;

  @Column({ default: 'false' })
  public isPublic: boolean;

  @CreateDateColumn()
  dateCreated: Date;

  @UpdateDateColumn()
  dateModified: Date;

  @DeleteDateColumn()
  dateDeleted: Date;

  @Column({ default: 'false' })
  deleted: boolean;

  @ManyToOne(() => User, (user: User) => user.posts)
  @JoinColumn()
  public owner: User;

  @ManyToOne(() => Category, (category: Category) => category.posts, {
    nullable: true,
  })
  @JoinColumn()
  public category: Category;

  @ManyToMany(() => PostTag, (postTag: PostTag) => postTag.posts)
  @JoinTable()
  public tags: PostTag[];
}
