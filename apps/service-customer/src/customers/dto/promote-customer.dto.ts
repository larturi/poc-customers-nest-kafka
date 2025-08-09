import { IsString, IsNotEmpty } from 'class-validator'

export class PromoteCustomerDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string
}
