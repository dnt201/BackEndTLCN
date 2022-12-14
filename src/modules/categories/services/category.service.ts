import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryPage } from '../dtos/categoryPage.dto';
import { CreateCategoryDTO } from '../dtos/createCategory.dto';
import { UpdateCategoryDTO } from '../dtos/updateCategory.dto';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getCategoryById(categoryId: string) {
    const category = await this.categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new NotFoundException(
        `Can not find category with id: ${categoryId}`,
      );
    }

    return category;
  }

  async getCategoryChild(categoryId: string) {
    const category = await this.categoryRepository.getCategoryById(categoryId);
    return this.categoryRepository.getCategoryTreeFromId(category);
  }

  async getCategoryTree() {
    return this.categoryRepository.getCategoryTree();
  }

  async createCategory(createCategoryData: CreateCategoryDTO) {
    const categoryExist = await this.categoryRepository.getCategoryByName(
      createCategoryData.categoryName,
    );

    if (categoryExist) {
      throw new BadRequestException(
        `Category name already exists. Try another name`,
      );
    }

    if (createCategoryData.rootCategoryId) {
      const categoryParent = await this.categoryRepository.getCategoryById(
        createCategoryData.rootCategoryId,
      );
      if (!categoryParent) {
        throw new NotFoundException(`Not found parent category. Try another`);
      }
    }

    const category = await this.categoryRepository.createCategory(
      createCategoryData,
    );
    await this.categoryRepository.save(category);
    return category;
  }

  async updateCategory(
    categoryId: string,
    updateCategoryData: UpdateCategoryDTO,
  ) {
    let categoryParent = null;
    const categoryExist = await this.categoryRepository.getCategoryByName(
      updateCategoryData.categoryName,
    );
    if (updateCategoryData.rootCategoryId) {
      categoryParent = await this.categoryRepository.getCategoryById(
        updateCategoryData.rootCategoryId,
      );
    }

    if (categoryExist && categoryExist.id !== categoryId) {
      throw new BadRequestException(
        `Category name already exists. Try another name`,
      );
    } else if (!categoryParent && updateCategoryData.rootCategoryId) {
      throw new NotFoundException(`Not found parent category. Try another`);
    } else if (categoryParent && categoryParent.id === categoryId) {
      throw new BadRequestException(
        `Can not set this category: ${categoryParent.categoryName} is parent of category`,
      );
    }

    console.log('GO here');

    await this.categoryRepository.updateCategory(
      categoryId,
      updateCategoryData,
    );
    return this.getCategoryById(categoryId);
  }

  async getCategoryTop() {
    return await this.categoryRepository.getCategoryTop();
  }

  async findCategory(dataSearch: string) {
    return await this.categoryRepository.findCategory(dataSearch);
  }

  async getAllCategory(page: CategoryPage, dataSearch: string) {
    return await this.categoryRepository.getAllCategory(page, dataSearch);
  }

  async getAllCategoryDelete(page: CategoryPage, dataSearch: string) {
    return await this.categoryRepository.getAllCategoryDelete(page, dataSearch);
  }

  async hideCategory(id: string) {
    return await this.categoryRepository.hideCategory(id);
  }

  async showCategory(id: string) {
    return await this.categoryRepository.showCategory(id);
  }
}
