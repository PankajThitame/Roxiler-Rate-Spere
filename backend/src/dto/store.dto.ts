import { IsEmail, IsNotEmpty, IsNumber, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateStoreDto {
  @ApiProperty({ example: 'The Vintage Bookshop and Coffee Cafe', minLength: 20, maxLength: 60 })
  @IsNotEmpty()
  @IsString()
  @Length(20, 60, { message: 'Store name must be between 20 and 60 characters long.' })
  name: string;

  @ApiProperty({ example: 'contact@vintagebooks.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @ApiProperty({ example: '456 Oak Avenue, Suite 100, Metropolis', maxLength: 400 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(400, { message: 'Address must not exceed 400 characters.' })
  address: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  ownerId: number;
}
