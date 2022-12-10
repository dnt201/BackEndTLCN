import { Exclude } from 'class-transformer';
import { ICreated } from 'src/common/model/ICreated.interface';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Notification')
export class Notification implements ICreated, IDeleted {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public body: string;

  @Column()
  public type: string;

  @Column()
  public userId: string;

  @Column()
  public timeOut: number;

  @Column()
  public maxAttempt: number;

  @Column({ nullable: true })
  public lastSent: Date;

  @Index('notiStatus')
  @Column()
  public status: string;

  @Column({ nullable: true })
  public refType: string;

  @Column({ nullable: true })
  public refId: string;

  @Column({ default: false })
  @Exclude()
  public deleted: boolean;

  @CreateDateColumn()
  @Exclude()
  public dateCreated: Date;

  @DeleteDateColumn()
  @Exclude()
  public dateDeleted: Date;

  @ManyToOne(() => User, (user: User) => user.posts)
  @JoinTable()
  public userSend: User;

  @Index('isClicked')
  @Column({ default: false })
  public isClicked: boolean;

  @Column({ nullable: true })
  public extendData: string;
}
