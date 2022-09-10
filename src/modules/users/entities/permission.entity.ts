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

@Entity('Permission')
export class Permission implements IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ unique: true })
  public permission: string;

  @Column({ unique: true })
  public displayName: string;

  @Column({ default: false })
  @Exclude()
  public deleted: boolean;

  @DeleteDateColumn()
  @Exclude()
  public dateDeleted: Date;

  @OneToMany(
    () => RolePermission,
    (rolePermission: RolePermission) => rolePermission.permission,
  )
  public rolePermission: RolePermission[];
}
