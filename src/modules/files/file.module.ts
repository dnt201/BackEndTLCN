import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingModule } from '../settings/setting.module';
import FileController from './controllers/file.controller';
import { File } from './entities/file.entity';
import { FileService } from './services/file.service';

@Module({
  imports: [TypeOrmModule.forFeature([File]), SettingModule],
  providers: [FileService],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
