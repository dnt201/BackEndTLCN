import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('SocketConnection')
export class SocketConnection {
  @PrimaryColumn()
  public userId: string;

  @Column()
  public socketToken: string;
}
