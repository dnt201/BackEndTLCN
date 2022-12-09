import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Image')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  imageId: string;

  @Column()
  public tinyId?: string;

  @Column()
  public fullId?: string;
}
