import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermission } from './role_permission.entity';
import { User } from './user.entity';

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column({ unique: true })
  public role: string;

  @Column({ unique: true })
  public displayName: string;

  @OneToMany(() => User, (user: User) => user.role)
  public user: User[];

  @OneToMany(
    () => RolePermission,
    (rolePermission: RolePermission) => rolePermission.role,
  )
  public rolePermission: RolePermission[];
}
