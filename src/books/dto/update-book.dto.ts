import { IsOptional, IsInt, Min, IsNotEmpty } from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  author?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number;
}
