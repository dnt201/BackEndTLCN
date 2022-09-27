import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('File')
export class File {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;
}
