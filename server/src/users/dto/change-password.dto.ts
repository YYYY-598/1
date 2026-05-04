import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  old_password!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  new_password!: string;
}
