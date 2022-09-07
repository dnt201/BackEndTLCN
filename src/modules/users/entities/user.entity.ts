import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ICreated } from 'src/common/model/ICreated.interface';
import { IModified } from 'src/common/model/IModified.interface';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import { Gender } from 'src/common/constants/gender.constant';

@Entity('User')
export class User implements ICreated, IModified, IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  @Column()
  @Index()
  public email: string;

  @Column()
  public username: string;

  @Column()
  public password: string;

  @Column({ default: '' })
  public shortInfo: string;

  @Column({ nullable: true })
  public phoneNumber: string;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.Unknown,
  })
  public role: Gender;

  @CreateDateColumn()
  public dateCreated: Date;

  @UpdateDateColumn()
  public dateModified: Date;

  @Column({ default: 'true' })
  @Index()
  public deleted: boolean;

  @DeleteDateColumn()
  public dateDeleted: Date;
}
