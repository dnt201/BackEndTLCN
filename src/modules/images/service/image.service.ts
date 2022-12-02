import { Injectable } from '@nestjs/common';
import { ImageDTO } from '../dto/image.dto';
import { ImageRepository } from '../repository/image.repository';

@Injectable()
export class ImageService {
  constructor(private readonly imageRepository: ImageRepository) {}

  async saveImage(imageDTO: ImageDTO) {
    const image = await this.imageRepository.saveImage(imageDTO);
    await this.imageRepository.save(image);
  }

  async getFullInfoImage(tinyLink: string) {
    if (tinyLink === null) return null;
    return await this.imageRepository.getFullInfoImage(tinyLink);
  }

  private async getImage(id: string) {
    return await this.imageRepository.getImage(id);
  }
}
