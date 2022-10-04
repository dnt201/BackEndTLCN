import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  StreamableFile,
  Res,
  Post,
  UseGuards,
  PayloadTooLargeException,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { FileService } from '../services/file.service';
import { FilesInterceptor } from 'src/modules/files/interceptors/file.interceptor';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import RequestWithUser from 'src/auth/interfaces/requestWithUser.interface';

@Controller('file')
@UseInterceptors(ClassSerializerInterceptor)
export default class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('create')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/files',
      fileFilter: (request, file, callback) => {
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2) * 50, // 50MB
      },
    }),
  )
  async addFile(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.saveLocalFileData({
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
  }

  @Get(':id')
  async getDatabaseFileById(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.fileService.getFileById(id);

    const stream = createReadStream(join(process.cwd(), file.path));

    response.set({
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'Content-Type': file.mimetype,
    });
    return new StreamableFile(stream);
  }
}
