import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PostTag')
export class PostTag {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public postTagName: string;

  @Column({ unique: true })
  public displayName: string;

  @Column({ unique: true })
  public colorCode: string;
}
