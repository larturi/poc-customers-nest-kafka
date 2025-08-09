import { validate } from 'class-validator'
import { FirstPaymentDto } from '../../../../src/customers/dto/first-payment.dto'

describe('FirstPaymentDto', () => {
  it('should validate a valid dto', async () => {
    const dto = new FirstPaymentDto()
    dto.customerId = '1234567890'
    dto.amount = 100.5
    dto.paymentMethod = 'credit_card'
    dto.description = 'Primer pago mensual'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should validate dto with minimal required fields', async () => {
    const dto = new FirstPaymentDto()
    dto.customerId = '1234567890'
    dto.amount = 100.5

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail validation when customerId is missing', async () => {
    const dto = new FirstPaymentDto()
    dto.amount = 100.5

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('customerId')
  })

  it('should fail validation when amount is missing', async () => {
    const dto = new FirstPaymentDto()
    dto.customerId = '1234567890'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('amount')
  })

  it('should fail validation when amount is not a number', async () => {
    const dto = new FirstPaymentDto()
    dto.customerId = '1234567890'
    ;(dto as any).amount = 'invalid-amount'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('amount')
  })

  it('should fail validation when customerId is empty string', async () => {
    const dto = new FirstPaymentDto()
    dto.customerId = ''
    dto.amount = 100.5

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('customerId')
  })
})
