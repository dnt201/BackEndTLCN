import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity('RolePermission')
export class RolePermission {
  @PrimaryColumn()
  roleId: string;

  @PrimaryColumn()
  permissionId: string;

  @ManyToOne(() => Role, (role: Role) => role.rolePermission, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  public role: Role;

  @ManyToOne(
    () => Permission,
    (permission: Permission) => permission.rolePermission,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permissionId' })
  public permission: Permission;
}
