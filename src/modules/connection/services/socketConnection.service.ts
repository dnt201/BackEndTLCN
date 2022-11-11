import { SocketConnectionDTO } from './../dto/socketConnection.dto';
import { Injectable } from '@nestjs/common';
import { SocketConnectionRepository } from '../repository/socketConnetion.repository';

@Injectable()
export class SocketConnectionService {
  constructor(
    private readonly socketConnectionRepository: SocketConnectionRepository,
  ) {}

  async connect(connectData: SocketConnectionDTO) {
    const connection = await this.socketConnectionRepository.connectSocketIO(
      connectData,
    );
    await this.socketConnectionRepository.save(connection);
    return connection;
  }

  async getConnection(userId: string) {
    const socketToken = await this.socketConnectionRepository.getConnection(
      userId,
    );
    return socketToken.socketToken;
  }

  async disconnect(userId: string) {
    return await this.socketConnectionRepository.disconnectSocketIO(userId);
  }
}
