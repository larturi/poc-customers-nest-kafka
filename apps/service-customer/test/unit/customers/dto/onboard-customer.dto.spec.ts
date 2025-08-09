import { validate } from 'class-validator'
import { OnboardCustomerDto } from '../../../../src/customers/dto/onboard-customer.dto'

describe('OnboardCustomerDto', () => {
  it('should validate a valid dto', async () => {
    const dto = new OnboardCustomerDto()
    dto.name = 'Juan Pérez'
    dto.email = 'juan@example.com'
    dto.phone = '+1234567890'
    dto.documentType = 'DNI'
    dto.documentNumber = '12345678'
    dto.birthDate = '1990-01-01'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should validate dto with minimal required fields', async () => {
    const dto = new OnboardCustomerDto()
    dto.name = 'María García'
    dto.email = 'maria@example.com'
    dto.phone = '+0987654321'

    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('should fail validation when name is missing', async () => {
    const dto = new OnboardCustomerDto()
    dto.email = 'juan@example.com'
    dto.phone = '+1234567890'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('name')
  })

  it('should fail validation when email is missing', async () => {
    const dto = new OnboardCustomerDto()
    dto.name = 'Juan Pérez'
    dto.phone = '+1234567890'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('email')
  })

  it('should fail validation when email is invalid', async () => {
    const dto = new OnboardCustomerDto()
    dto.name = 'Juan Pérez'
    dto.email = 'invalid-email'
    dto.phone = '+1234567890'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('email')
  })

  it('should fail validation when phone is missing', async () => {
    const dto = new OnboardCustomerDto()
    dto.name = 'Juan Pérez'
    dto.email = 'juan@example.com'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('phone')
  })

  it('should fail validation when birthDate is invalid', async () => {
    const dto = new OnboardCustomerDto()
    dto.name = 'Juan Pérez'
    dto.email = 'juan@example.com'
    dto.phone = '+1234567890'
    dto.birthDate = 'invalid-date'

    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('birthDate')
  })
})
