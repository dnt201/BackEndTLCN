import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageService } from './service/image.service';
import { Image } from './entity/image.entity';
import { ImageRepository } from './repository/image.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  providers: [ImageService, ImageRepository],
  exports: [ImageService],
  controllers: [],
})
export class ImageModule {}
