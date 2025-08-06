import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator'

export class FirstPaymentDto {
  @IsString()
  @IsNotEmpty()
  customerId: string

  @IsNumber()
  @IsNotEmpty()
  amount: number

  @IsString()
  @IsOptional()
  paymentMethod?: string

  @IsString()
  @IsOptional()
  description?: string
}
