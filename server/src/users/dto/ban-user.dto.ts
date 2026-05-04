import { IsBoolean } from 'class-validator';

export class BanUserDto {
  @IsBoolean()
  is_banned!: boolean;
}
