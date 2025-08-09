import { validate } from 'class-validator'
import { PromoteCustomerDto } from '../../../../src/profiling/dto/promote-customer.dto'

describe('PromoteCustomerDto', () => {
  let dto: PromoteCustomerDto

  beforeEach(() => {
    dto = new PromoteCustomerDto()
  })

  it('should be defined', () => {
    expect(dto).toBeDefined()
  })

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      dto.customerId = '1234567890'
      dto.age = 25
      dto.income = 50000
      dto.creditScore = 700
      dto.isFirstPayment = true
      dto.newTier = 'premium'
      dto.reason = 'Cliente de alto valor'

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should fail validation with missing customerId', async () => {
      dto.age = 25
      dto.income = 50000
      dto.creditScore = 700
      dto.isFirstPayment = true
      dto.newTier = 'premium'
      dto.reason = 'Cliente de alto valor'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with invalid age (negative)', async () => {
      dto.customerId = '1234567890'
      dto.age = -5
      dto.income = 50000
      dto.creditScore = 700
      dto.isFirstPayment = true
      dto.newTier = 'premium'
      dto.reason = 'Cliente de alto valor'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.min).toBeDefined()
    })

    it('should fail validation with invalid age (too high)', async () => {
      dto.customerId = '1234567890'
      dto.age = 150
      dto.income = 50000
      dto.creditScore = 700
      dto.isFirstPayment = true
      dto.newTier = 'premium'
      dto.reason = 'Cliente de alto valor'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.max).toBeDefined()
    })

    it('should fail validation with invalid creditScore (too low)', async () => {
      dto.customerId = '1234567890'
      dto.age = 25
      dto.income = 50000
      dto.creditScore = 250
      dto.isFirstPayment = true
      dto.newTier = 'premium'
      dto.reason = 'Cliente de alto valor'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.min).toBeDefined()
    })

    it('should fail validation with invalid creditScore (too high)', async () => {
      dto.customerId = '1234567890'
      dto.age = 25
      dto.income = 50000
      dto.creditScore = 900
      dto.isFirstPayment = true
      dto.newTier = 'premium'
      dto.reason = 'Cliente de alto valor'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.max).toBeDefined()
    })

    it('should fail validation with missing newTier', async () => {
      dto.customerId = '1234567890'
      dto.age = 25
      dto.income = 50000
      dto.creditScore = 700
      dto.isFirstPayment = true
      dto.reason = 'Cliente de alto valor'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with missing reason', async () => {
      dto.customerId = '1234567890'
      dto.age = 25
      dto.income = 50000
      dto.creditScore = 700
      dto.isFirstPayment = true
      dto.newTier = 'premium'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })
  })
})
