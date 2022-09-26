import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Setting')
export class Setting {
  @PrimaryColumn()
  public group: string;

  @PrimaryColumn()
  public key: string;

  @Column({ nullable: true })
  public value: string;
}
