import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @IsString()
  public categoryName: string;
  @IsOptional()
  @IsString()
  public rootCategoryId: string;
}
