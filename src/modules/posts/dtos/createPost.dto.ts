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

export class CreatePostInput {
  public title: string;
  public content: string;
  public category: string;
  public tags: string;
}
