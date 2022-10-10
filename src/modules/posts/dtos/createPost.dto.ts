import { IsOptional, IsString } from 'class-validator';

export class CreatePostDTO {
  @IsString()
  public title: string;

  @IsString()
  public content: string;

  @IsString()
  @IsOptional()
  public category: string;

  @IsOptional()
  @IsString({ each: true })
  public tags: string[];
}
