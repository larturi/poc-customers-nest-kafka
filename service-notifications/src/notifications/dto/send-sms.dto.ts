import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  template!: string;

  @IsObject()
  data!: Record<string, any>;
} 