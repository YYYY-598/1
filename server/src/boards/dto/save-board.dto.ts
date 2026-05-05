import { IsString, Length } from 'class-validator';

export class SaveBoardDto {
  @IsString()
  @Length(1, 50)
  name!: string;

  @IsString()
  @Length(0, 200)
  description!: string;
}
