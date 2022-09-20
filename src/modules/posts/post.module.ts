import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTagController } from './controllers/postTag.controller';
import { PostTag } from './entities/postTag.entity';
import { PostTagRepository } from './repositories/postTag.repository';
import { PostTagService } from './services/postTag.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostTag])],
  providers: [PostTagService, PostTagRepository],
  controllers: [PostTagController],
  exports: [PostTagService],
})
export class PostModule {}
