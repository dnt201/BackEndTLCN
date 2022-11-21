import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const categoryExist = await this.categoryRepository.getCategoryByName(
      updateCategoryData.categoryName,
    );
    const categoryParent = await this.categoryRepository.getCategoryById(
      updateCategoryData.rootCategoryId,
    );
    if (categoryExist && categoryExist.id !== categoryId) {
      throw new BadRequestException(
        `Category name already exists. Try another name`,
      );
    } else if (!categoryParent) {
      throw new NotFoundException(`Not found parent category. Try another`);
    } else if (categoryParent && categoryParent.id === categoryId) {
      throw new BadRequestException(
        `Can not set this category: ${categoryParent.categoryName} is parent of category`,
      );
    }

    await this.categoryRepository.updateCategory(
      categoryId,
      updateCategoryData,
    );
    return this.getCategoryById(categoryId);
  }

  async getCategoryTop() {
    return await this.categoryRepository.getCategoryTop();
  }
}
