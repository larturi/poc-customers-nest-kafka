import {
  IsString,
  IsEmail,
  IsObject,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class SendEmailDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsEmail()
  @IsNotEmpty()
  to!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  template!: string;

  @IsObject()
  data!: Record<string, any>;
}
