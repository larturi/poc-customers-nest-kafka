import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class SendSmsDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  to!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  template!: string;

  @IsObject()
  data!: Record<string, any>;
}
