import { validate } from 'class-validator'
import { DeactivateCustomerDto } from '../../../../src/customers/dto/deactivate-customer.dto'

describe('DeactivateCustomerDto', () => {
  it('should validate a valid dto', async () => {
    const dto = new DeactivateCustomerDto()
    dto.customerId = '1234567890'
    dto.deactivationReason = 'Cliente solicitó desactivación'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail validation when customerId is missing', async () => {
    const dto = new DeactivateCustomerDto()
    dto.deactivationReason = 'Cliente solicitó desactivación'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('customerId')
  })

  it('should fail validation when deactivationReason is missing', async () => {
    const dto = new DeactivateCustomerDto()
    dto.customerId = '1234567890'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('deactivationReason')
  })

  it('should fail validation when customerId is empty string', async () => {
    const dto = new DeactivateCustomerDto()
    dto.customerId = ''
    dto.deactivationReason = 'Cliente solicitó desactivación'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('customerId')
  })

  it('should fail validation when deactivationReason is empty string', async () => {
    const dto = new DeactivateCustomerDto()
    dto.customerId = '1234567890'
    dto.deactivationReason = ''

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('deactivationReason')
  })
})
