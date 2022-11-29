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
import { CategoryPage } from '../dtos/categoryPage.dto';
import { PagedData } from 'src/common/dto/PageData';
import { ReturnResult } from 'src/common/dto/ReturnResult';
import { Category } from '../entities/category.entity';

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

  // @Get()
  // async getCategoryTree() {
  //   return await this.categoryService.getCategoryTree();
  // }

  @Get()
  async getAllCategory(@Body() page: CategoryPage, @Query() searchData) {
    const dataReturn: ReturnResult<PagedData<Category>> = new ReturnResult<
      PagedData<Category>
    >();

    let dataSearch = '';
    if (searchData?.name == null) dataSearch = '';
    else dataSearch = searchData.name;

    const value = await this.categoryService.getAllCategory(page, dataSearch);
    dataReturn.result = value;
    dataReturn.message = null;

    return dataReturn;
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

  @Get('delete')
  @UseGuards(PermissionGuard(ListPermission.GetDeleteCategory))
  async getAllCategoryDelete(@Body() page: CategoryPage, @Query() searchData) {
    const dataReturn: ReturnResult<PagedData<Category>> = new ReturnResult<
      PagedData<Category>
    >();

    let dataSearch = '';
    if (searchData?.name == null) dataSearch = '';
    else dataSearch = searchData.name;

    const value = await this.categoryService.getAllCategoryDelete(
      page,
      dataSearch,
    );
    dataReturn.result = value;
    dataReturn.message = null;

    return dataReturn;
  }

  @Post('hide/:id')
  @UseGuards(PermissionGuard(ListPermission.HideCategory))
  async hideCategory(@Param('id') id: string) {
    return await this.categoryService.hideCategory(id);
  }

  @Post('show/:id')
  @UseGuards(PermissionGuard(ListPermission.ShowCategory))
  async showCategory(@Param('id') id: string) {
    return await this.categoryService.showCategory(id);
  }
}
