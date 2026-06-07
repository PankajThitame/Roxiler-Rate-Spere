import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Johnathan Alexander Doe Jr', minLength: 20, maxLength: 60 })
  @IsNotEmpty()
  @IsString()
  @Length(20, 60, { message: 'Name must be between 20 and 60 characters long.' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @ApiProperty({ example: 'Password@123', minLength: 8, maxLength: 16 })
  @IsNotEmpty()
  @IsString()
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;

  @ApiProperty({ example: '123 Main Street, Suite 4B, Springfield', required: false, maxLength: 400 })
  @IsOptional()
  @IsString()
  @MaxLength(400, { message: 'Address must not exceed 400 characters.' })
  address?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@store.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
