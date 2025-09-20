import { IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  author: string;

  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  pages: number;
}
