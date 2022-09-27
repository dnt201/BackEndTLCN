import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { SettingService } from '../../settings/services/setting.service';

interface FileInterceptorOptions {
  fieldName: string;
  path?: string;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

export function FilesInterceptor(
  options: FileInterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(private readonly settingService: SettingService) {}

    async makeFileInterceptor() {
      const filesDestination =
        await this.settingService.getSettingByKeyAndGroup(
          'UPLOADED_FILE_DESTINATION',
          'GENERAL',
        );

      const destination = `${filesDestination.value}${options.path}`;

      const multerOptions: MulterOptions = {
        storage: diskStorage({
          destination,
        }),
        fileFilter: options.fileFilter,
        limits: options.limits,
      };

      this.fileInterceptor = new (FileInterceptor(
        options.fieldName,
        multerOptions,
      ))();
    }

    async intercept(...args: Parameters<NestInterceptor['intercept']>) {
      await this.makeFileInterceptor();
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}
