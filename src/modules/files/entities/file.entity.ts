import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('File')
export class File {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;
}
