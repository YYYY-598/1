import { IsString, Length } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  @IsString()
  @Length(1, 20000)
  content!: string;
}
