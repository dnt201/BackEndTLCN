import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ImageDTO } from '../dto/image.dto';
import { Image } from '../entity/image.entity';

@Injectable()
export class ImageRepository extends Repository<Image> {
  constructor(private dataSource: DataSource) {
    super(Image, dataSource.createEntityManager());
  }

  async saveImage(imageDTO: ImageDTO) {
    const image = await this.create(imageDTO);
    return image;
  }

  async getFullInfoImage(fullId: string) {
    const info = await this.findOne({ where: { fullId: fullId } });
    return info;
  }

  async getImage(id: string) {
    const image = await this.findOne({ where: { imageId: id } });
    return image;
  }
}
