import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketConnection } from './entity/socketConnection.entity';
import { SocketConnectionRepository } from './repository/socketConnetion.repository';
import { SocketConnectionService } from './services/socketConnection.service';

@Module({
  imports: [TypeOrmModule.forFeature([SocketConnection])],
  controllers: [],
  providers: [SocketConnectionRepository, SocketConnectionService],
  exports: [SocketConnectionService],
})
export class ConnectionModule {}
