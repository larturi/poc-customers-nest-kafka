import { IsString, IsEmail, IsObject, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  template!: string;

  @IsObject()
  data!: Record<string, any>;
} 