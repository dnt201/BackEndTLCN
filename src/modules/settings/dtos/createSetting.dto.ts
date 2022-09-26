import { IsString, Matches } from 'class-validator';

export class CreateSettingDTO {
  @Matches(/^[A-Z_]+$/, {
    message: 'Group setting should be uppercase and _',
  })
  public group: string;
  @Matches(/^[A-Z_]+$/, {
    message: 'Key setting should be uppercase and _',
  })
  public key: string;
  @IsString()
  public value: string;
}
