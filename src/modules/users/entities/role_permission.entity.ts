import { IDeleted } from 'src/common/model/IDeleted.interface';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('RolePermission')
export class RolePermission implements IDeleted {
  @PrimaryColumn()
  roleId: string;

  @PrimaryColumn()
  permissionId: string;

  @ManyToOne(() => Role, (role: Role) => role.rolePermission)
  @JoinColumn({ name: 'roleId' })
  public role: Role;

  @ManyToOne(
    () => Permission,
    (permission: Permission) => permission.rolePermission,
  )
  @JoinColumn({ name: 'permissionId' })
  public permission: Permission;

  @Column({ default: false })
  public deleted: boolean;

  @DeleteDateColumn()
  public dateDeleted: Date;
}
