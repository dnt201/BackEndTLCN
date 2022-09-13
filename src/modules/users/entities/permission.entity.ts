import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermission } from './role_permission.entity';

@Entity('Permission')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ unique: true })
  public permission: string;

  @Column({ unique: true })
  public displayName: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission: RolePermission) => rolePermission.permission,
  )
  public rolePermission: RolePermission[];
}
