import { Exclude } from 'class-transformer';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('Role')
export class Role implements IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ unique: true })
  public role: string;

  @Column()
  public displayName: string;

  @Column({ default: false })
  @Exclude()
  public deleted: boolean;

  @DeleteDateColumn()
  @Exclude()
  public dateDeleted: Date;

  @OneToMany(() => User, (user: User) => user.role)
  public user: User[];
}
