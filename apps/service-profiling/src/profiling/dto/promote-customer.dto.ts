import { IsString, IsNumber, IsBoolean, IsNotEmpty, Min, Max } from 'class-validator';

export class PromoteCustomerDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsNumber()
  @Min(0)
  @Max(120)
  age!: number;

  @IsNumber()
  @Min(0)
  income!: number;

  @IsNumber()
  @Min(300)
  @Max(850)
  creditScore!: number;

  @IsBoolean()
  isFirstPayment!: boolean;
} 