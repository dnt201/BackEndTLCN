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
import { PostTagService } from '../services/postTag.service';
import { PostTag_Permission as ListPermission } from '../permission/permission';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { CreatePostTagDTO } from '../dtos/createPostTag.dto';
import { UpdatePostTagDTO } from '../dtos/updatePostTag.dto';
import { PostTagPage } from '../dtos/posttagPage.dto';
import { PagedData } from 'src/common/dto/PageData';
import { ReturnResult } from 'src/common/dto/ReturnResult';
import { FilesInterceptor } from 'src/modules/files/interceptors/file.interceptor';
import { PostTagWithMoreInfo } from '../dtos/postTagWithMoreInfo';

@Controller('post/post-tag')
@UseInterceptors(ClassSerializerInterceptor)
export class PostTagController {
  constructor(private readonly postTagService: PostTagService) {}

  @Post()
  async getAllPostTag(@Body() page: PostTagPage, @Query() searchData) {
    const dataReturn: ReturnResult<PagedData<PostTagWithMoreInfo>> =
      new ReturnResult<PagedData<PostTagWithMoreInfo>>();

    let dataSearch = '';
    if (searchData?.name == null) dataSearch = '';
    else dataSearch = searchData.name;

    const value = await this.postTagService.getAllPostTags(page, dataSearch);
    dataReturn.result = value;
    dataReturn.message = null;

    return dataReturn;
  }

  @Get('top')
  async getTopPostTag() {
    return await this.postTagService.getTopPostTag();
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
  async deletePostTag(@Param('id') id: string) {
    const existedPostTag = await this.postTagService.getPostTagById(id);

    if (!existedPostTag)
      throw new NotFoundException(`Not found Post Tag with id ${id}`);

    return await this.postTagService.deletePostTag(id);
  }

  @Post('hide')
  @UseGuards(PermissionGuard(ListPermission.GetHidePostTag))
  async getAllPostTagHide(@Body() page: PostTagPage, @Query() searchData) {
    const dataReturn: ReturnResult<PagedData<PostTagWithMoreInfo>> =
      new ReturnResult<PagedData<PostTagWithMoreInfo>>();

    let dataSearch = '';
    if (searchData?.name == null) dataSearch = '';
    else dataSearch = searchData.name;

    const value = await this.postTagService.getAllPostTagDelete(
      page,
      dataSearch,
    );
    dataReturn.result = value;
    dataReturn.message = null;

    return dataReturn;
  }

  @Post('hide/:id')
  @UseGuards(PermissionGuard(ListPermission.HidePostTag))
  async hidePostTag(@Param('id') id: string) {
    return await this.postTagService.hidePostTag(id);
  }

  @Post('show/:id')
  @UseGuards(PermissionGuard(ListPermission.ShowPostTag))
  async showPostTag(@Param('id') id: string) {
    return await this.postTagService.showPostTag(id);
  }
}
