import { validate } from 'class-validator'
import { SendEmailDto } from '../../../../src/notifications/dto/send-email.dto'

describe('SendEmailDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new SendEmailDto()
      dto.to = 'test@example.com'
      dto.subject = 'Test Subject'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should pass validation with optional customerId', async () => {
      const dto = new SendEmailDto()
      dto.customerId = '1234567890'
      dto.to = 'test@example.com'
      dto.subject = 'Test Subject'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should fail validation with invalid email', async () => {
      const dto = new SendEmailDto()
      dto.to = 'invalid-email'
      dto.subject = 'Test Subject'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isEmail).toBeDefined()
    })

    it('should fail validation with empty email', async () => {
      const dto = new SendEmailDto()
      dto.subject = 'Test Subject'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with empty subject', async () => {
      const dto = new SendEmailDto()
      dto.to = 'test@example.com'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with empty template', async () => {
      const dto = new SendEmailDto()
      dto.to = 'test@example.com'
      dto.subject = 'Test Subject'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with empty data', async () => {
      const dto = new SendEmailDto()
      dto.to = 'test@example.com'
      dto.subject = 'Test Subject'
      dto.template = 'welcome'
      // No asignamos data

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isObject).toBeDefined()
    })
  })

  describe('properties', () => {
    it('should have all required properties', () => {
      const dto = new SendEmailDto()
      dto.to = 'test@example.com'
      dto.subject = 'Test Subject'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      expect(dto.to).toBe('test@example.com')
      expect(dto.subject).toBe('Test Subject')
      expect(dto.template).toBe('welcome')
      expect(dto.data).toEqual({ name: 'John Doe' })
    })

    it('should have optional customerId property', () => {
      const dto = new SendEmailDto()
      dto.customerId = '1234567890'
      dto.to = 'test@example.com'
      dto.subject = 'Test Subject'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      expect(dto.customerId).toBe('1234567890')
    })
  })
})
