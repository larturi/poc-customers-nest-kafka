import { validate } from 'class-validator'
import { ActivateCustomerDto } from '../../../../src/customers/dto/activate-customer.dto'

describe('ActivateCustomerDto', () => {
  it('should validate a valid dto', async () => {
    const dto = new ActivateCustomerDto()
    dto.customerId = '1234567890'
    dto.activationReason = 'Documentación verificada'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail validation when customerId is missing', async () => {
    const dto = new ActivateCustomerDto()
    dto.activationReason = 'Documentación verificada'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('customerId')
  })

  it('should fail validation when activationReason is missing', async () => {
    const dto = new ActivateCustomerDto()
    dto.customerId = '1234567890'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('activationReason')
  })

  it('should fail validation when customerId is empty string', async () => {
    const dto = new ActivateCustomerDto()
    dto.customerId = ''
    dto.activationReason = 'Documentación verificada'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('customerId')
  })

  it('should fail validation when activationReason is empty string', async () => {
    const dto = new ActivateCustomerDto()
    dto.customerId = '1234567890'
    dto.activationReason = ''

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('activationReason')
  })
})
