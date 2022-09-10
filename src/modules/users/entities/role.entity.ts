import { Exclude } from 'class-transformer';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolePermission } from './role_permission.entity';
import { User } from './user.entity';

@Entity('Role')
export class Role implements IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ unique: true })
  public role: string;

  @Column({ unique: true })
  public displayName: string;

  @Column({ default: false })
  @Exclude()
  public deleted: boolean;

  @DeleteDateColumn()
  @Exclude()
  public dateDeleted: Date;

  @OneToMany(() => User, (user: User) => user.role)
  public user: User[];

  @OneToMany(
    () => RolePermission,
    (rolePermission: RolePermission) => rolePermission.role,
  )
  public rolePermission: RolePermission[];
}
