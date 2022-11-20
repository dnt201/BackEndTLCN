import { ICreated } from 'src/common/model/ICreated.interface';
import { IDeleted } from 'src/common/model/IDeleted.interface';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
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
  public deleted: boolean;

  @CreateDateColumn()
  public dateCreated: Date;

  @DeleteDateColumn()
  public dateDeleted: Date;

  @Index('isClicked')
  @Column({ default: false })
  public isClicked: boolean;

  @Column({ nullable: true })
  public extendData: string;
}
