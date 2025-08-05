import { IsString, IsNotEmpty } from 'class-validator';

export class ActivateCustomerDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  activationReason!: string;
} 