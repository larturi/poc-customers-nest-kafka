import { IsString, IsNotEmpty } from 'class-validator';

export class DeactivateCustomerDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  deactivationReason!: string;
} 