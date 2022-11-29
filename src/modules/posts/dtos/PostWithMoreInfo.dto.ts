import { Category } from 'src/modules/categories/entities/category.entity';
import { PostTag } from '../entities/postTag.entity';

export class PostWithMoreInfo {
  id: string;
  title: string;
  dateModified: Date;
  owner: {
    id: string;
    username: string;
    avatarLink: string;
  };
  category: Category;
  tags: PostTag[];
  isFollow?: boolean;
  like: number;
  comment: number;
  view: number;
  thumbnailLink: string;
}
