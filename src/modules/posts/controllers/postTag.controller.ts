import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostTag } from '../entities/postTag.entity';
import { PostTagService } from '../services/postTag.service';
import { PostTag_Permission as ListPermission } from '../permission/permission';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { CreatePostTagDTO } from '../dtos/createPostTag.dto';
import { UpdatePostTagDTO } from '../dtos/updatePostTag.dto';
import { FindOneParams } from 'src/utils/findOneParams';
import { PostTagPage } from '../dtos/posttagPage.dto';
import { PagedData } from 'src/common/dto/PageData';
import { ReturnResult } from 'src/common/dto/ReturnResult';

@Controller('post/post-tag')
@UseInterceptors(ClassSerializerInterceptor)
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) {}

  @Get()
  async getAllPostTag(@Body() page: PostTagPage) {
    const dataReturn: ReturnResult<PagedData<PostTag>> = new ReturnResult<
      PagedData<PostTag>
    >();
    const value = await this.postTagService.getAllPostTags(page);
    dataReturn.result = value;
    dataReturn.message = null;

    return dataReturn;
  }

  @Post('create')
  @UseGuards(PermissionGuard(ListPermission.AddPostTag))
  async createPostTag(@Body() postTagData: CreatePostTagDTO): Promise<PostTag> {
    return await this.postTagService.createPostTag(postTagData);
  }

  @Put('edit/:id')
  @UseGuards(PermissionGuard(ListPermission.EditPostTag))
  async updatePostTag(
    @Param() { id }: FindOneParams,
    @Body() postTagData: UpdatePostTagDTO,
  ) {
    const existedPostTag = await this.postTagService.getPostTagById(id);

    if (!existedPostTag)
      throw new NotFoundException(`Not found PostTag with id ${id}`);

    return await this.postTagService.updatePostTag(id, postTagData);
  }

  @Delete('delete/:id')
  @UseGuards(PermissionGuard(ListPermission.DeletePostTag))
  async deletePostTag(@Param() { id }: FindOneParams) {
    const existedPostTag = await this.postTagService.getPostTagById(id);

    if (!existedPostTag)
      throw new NotFoundException(`Not found Post Tag with id ${id}`);

    return await this.postTagService.deletePostTag(Number(id));
  }
}
