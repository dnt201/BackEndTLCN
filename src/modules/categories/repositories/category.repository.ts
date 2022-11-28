import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Page } from 'src/common/dto/Page';
import { PagedData } from 'src/common/dto/PageData';
import { ConvertOrderQuery } from 'src/utils/convertOrderQuery';
import { DataSource, ILike, TreeRepository } from 'typeorm';
import { CategoryPage } from '../dtos/categoryPage.dto';
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

  async getCategoryTop() {
    try {
      const postCount = await this.createQueryBuilder('Category')
        .leftJoinAndSelect('Category.posts', 'Post')
        .loadRelationCountAndMap('Category.PostCount', 'Category.posts')
        // .orderBy('Category.PostCount', 'DESC')
        .select('Category')
        .getMany();

      postCount
        .sort((a, b) => (a['PostCount'] < b['PostCount'] ? 1 : -1))
        .slice(0, 5);

      return postCount;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllCategory(page: CategoryPage, dataSearch: string) {
    const orderQuery =
      page?.order?.length === 0 ? {} : ConvertOrderQuery(page.order);

    const takeQuery = page.size ?? 10;
    const skipQuery = page?.pageNumber > 0 ? page.pageNumber : 1;

    const dataReturn: PagedData<Category> = new PagedData<Category>();

    try {
      const listCategory = await this.find({
        where: {
          categoryName: ILike(`%${dataSearch}%`),
        },
        order: orderQuery,
        take: takeQuery,
        skip: (skipQuery - 1) * takeQuery,
      });
      const totalCategory = await this.count({
        where: {
          categoryName: ILike(`%${dataSearch}%`),
        },
      });

      dataReturn.data = listCategory;
      dataReturn.page = new Page(
        takeQuery,
        skipQuery,
        totalCategory,
        page?.order ?? [],
      );
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findCategory(dataSearch: string) {
    const dataReturn: PagedData<Category> = new PagedData<Category>();

    try {
      const listCategory = await this.find({
        where: {
          categoryName: ILike(`%${dataSearch}%`),
        },
        take: 5,
      });
      const totalCategory = await this.count({
        where: {
          categoryName: ILike(`%${dataSearch}%`),
        },
      });

      dataReturn.data = listCategory;
      dataReturn.page = new Page(5, 0, totalCategory, []);
      return dataReturn;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
