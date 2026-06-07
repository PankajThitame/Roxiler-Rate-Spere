import { IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRatingDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  storeId: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating cannot exceed 5.' })
  @Type(() => Number)
  rating: number;
}

export class UpdateRatingDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1.' })
  @Max(5, { message: 'Rating cannot exceed 5.' })
  @Type(() => Number)
  rating: number;
}
