import { IsString, Matches } from 'class-validator';

export class CreatePostTagDTO {
  @Matches(/^[A-Za-z0-9-+/*#]+$/, {
    message: 'Post Tag must not have spaces, please use - instead of space',
  })
  public postTagName: string;

  @IsString()
  public displayName: string;

  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'This is not color code, please try again.',
  })
  public colorCode: string;
}
