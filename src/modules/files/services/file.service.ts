import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileDTO } from '../dtos/file.dto';
import { File } from '../entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async saveLocalFileData(fileData: FileDTO) {
    const newFile = await this.fileRepository.create(fileData);
    await this.fileRepository.save(newFile);
    return newFile;
  }

  async getFileById(fileId: number) {
    const file = await this.fileRepository.findOne({ where: [{ id: fileId }] });
    if (!file) {
      throw new NotFoundException(`Not found file with id ${fileId}`);
    }
    return file;
  }
}
