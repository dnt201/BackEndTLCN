import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  PayloadTooLargeException,
  Post,
  Put,
  Query,
  UploadedFile,
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
import { FilesInterceptor } from 'src/modules/files/interceptors/file.interceptor';

@Controller('post/post-tag')
@UseInterceptors(ClassSerializerInterceptor)
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) {}

  @Get()
  async getAllPostTag(@Body() page: PostTagPage, @Query() searchData) {
    const dataReturn: ReturnResult<PagedData<PostTag>> = new ReturnResult<
      PagedData<PostTag>
    >();

    let dataSearch = '';
    if (searchData?.name == null) dataSearch = '';
    else dataSearch = searchData.name;

    const value = await this.postTagService.getAllPostTags(page, dataSearch);
    dataReturn.result = value;
    dataReturn.message = null;

    return dataReturn;
  }

  @Post('create')
  @UseGuards(PermissionGuard(ListPermission.AddPostTag))
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post-tag',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async createPostTag(
    @UploadedFile() file: Express.Multer.File,
    @Body() postTagData: CreatePostTagDTO,
  ) {
    const postTag = await this.postTagService.createPostTag(postTagData);
    if (file) {
      await this.postTagService.addThumbnail(postTag.id, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }
    return await this.postTagService.getPostTagById(postTag.id);
  }

  @Put('edit/:id')
  @UseGuards(PermissionGuard(ListPermission.EditPostTag))
  @UseInterceptors(
    FilesInterceptor({
      fieldName: 'file',
      path: '/post-tag',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new PayloadTooLargeException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(1024, 2), // 1MB
      },
    }),
  )
  async updatePostTag(
    @Param() { id },
    @UploadedFile() file: Express.Multer.File,
    @Body() postTagData: UpdatePostTagDTO,
  ) {
    const existedPostTag = await this.postTagService.getPostTagById(id);

    if (!existedPostTag)
      throw new NotFoundException(`Not found PostTag with id ${id}`);

    await this.postTagService.updatePostTag(id, postTagData);
    if (file) {
      await this.postTagService.editImage(id, {
        path: file.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
    }

    return this.postTagService.getPostTagById(id);
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
