import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, TreeRepository } from 'typeorm';
import { CreateCategoryDTO } from '../dtos/createCategory.dto';
import { UpdateCategoryDTO } from '../dtos/updateCategory.dto';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryRepository extends TreeRepository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async getCategoryById(categoryId: string) {
    try {
      const category = await this.findOne({ where: [{ id: categoryId }] });
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCategoryByName(categoryName: string) {
    try {
      const category = await this.findOne({
        where: [{ categoryName: categoryName }],
      });
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCategoryTreeFromId(category: Category) {
    try {
      const categoryTree = await this.findDescendantsTree(category);
      return categoryTree;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCategoryTree() {
    try {
      const categoryTree = await this.findTrees();
      return categoryTree;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createCategory(createCategoryData: CreateCategoryDTO) {
    try {
      const data = new Category();
      data.categoryName = createCategoryData.categoryName;
      if (createCategoryData.rootCategoryId) {
        const categoryParent = await this.getCategoryById(
          createCategoryData.rootCategoryId,
        );
        data.rootCategory = categoryParent;
      }

      return await this.dataSource.manager.save(data);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateCategory(id: string, updateCategoryData: UpdateCategoryDTO) {
    try {
      const data = await this.getCategoryById(id);
      const categoryParent = await this.getCategoryById(
        updateCategoryData.rootCategoryId,
      );
      data.rootCategory = categoryParent;
      data.categoryName = updateCategoryData.categoryName;

      return await this.dataSource.manager.save(data);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}