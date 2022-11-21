import { CreateCategoryDTO } from './../dtos/createCategory.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { UpdateCategoryDTO } from '../dtos/updateCategory.dto';
import { Category_Permission as ListPermission } from '../permissions/permisison';
import { PermissionGuard } from 'src/auth/guards/permission.guard';

@Controller('category')
@UseInterceptors(ClassSerializerInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(PermissionGuard(ListPermission.AddCategory))
  async createCategory(@Body() createCategoryData: CreateCategoryDTO) {
    return await this.categoryService.createCategory(createCategoryData);
  }

  @Put('edit/:id')
  @UseGuards(PermissionGuard(ListPermission.EditCategory))
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryData: UpdateCategoryDTO,
  ) {
    return await this.categoryService.updateCategory(id, updateCategoryData);
  }

  @Get()
  async getCategoryTree() {
    return await this.categoryService.getCategoryTree();
  }

  @Get('top')
  async getCategoryTop() {
    return await this.categoryService.getCategoryTop();
  }

  @Get('find')
  async findCategory(@Query() searchData) {
    let dataSearch = '';
    if (searchData['name'] && searchData['name'].length > 0)
      dataSearch = searchData['name'];
    return await this.categoryService.findCategory(dataSearch);
  }
}
