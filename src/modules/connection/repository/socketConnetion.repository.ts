import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SocketConnectionDTO } from '../dto/socketConnection.dto';
import { SocketConnection } from '../entity/socketConnection.entity';

@Injectable()
export class SocketConnectionRepository extends Repository<SocketConnection> {
  constructor(private dataSource: DataSource) {
    super(SocketConnection, dataSource.createEntityManager());
  }

  async connectSocketIO(connection: SocketConnectionDTO) {
    try {
      const socket = await this.create(connection);
      return socket;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getConnection(userId: string) {
    try {
      const socket = await this.findOne({ where: { userId: userId } });
      return socket;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async disconnectSocketIO(userId: string) {
    try {
      const deletedResponse = await this.delete(userId);
      if (!deletedResponse.affected) {
        throw new BadRequestException(`Connection not found`);
      }
    } catch (error) {
      if (error.code === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error.message);
      else throw new InternalServerErrorException(error.message);
    }
  }
}
