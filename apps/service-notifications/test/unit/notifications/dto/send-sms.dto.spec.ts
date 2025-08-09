import { validate } from 'class-validator'
import { SendSmsDto } from '../../../../src/notifications/dto/send-sms.dto'

describe('SendSmsDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new SendSmsDto()
      dto.to = '+1234567890'
      dto.message = 'Test message'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should pass validation with optional customerId', async () => {
      const dto = new SendSmsDto()
      dto.customerId = '1234567890'
      dto.to = '+1234567890'
      dto.message = 'Test message'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('should fail validation with empty to', async () => {
      const dto = new SendSmsDto()
      dto.message = 'Test message'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with empty message', async () => {
      const dto = new SendSmsDto()
      dto.to = '+1234567890'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with empty template', async () => {
      const dto = new SendSmsDto()
      dto.to = '+1234567890'
      dto.message = 'Test message'
      dto.data = { name: 'John Doe' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBeDefined()
    })

    it('should fail validation with empty data', async () => {
      const dto = new SendSmsDto()
      dto.to = '+1234567890'
      dto.message = 'Test message'
      dto.template = 'welcome'
      // No asignamos data

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isObject).toBeDefined()
    })
  })

  describe('properties', () => {
    it('should have all required properties', () => {
      const dto = new SendSmsDto()
      dto.to = '+1234567890'
      dto.message = 'Test message'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      expect(dto.to).toBe('+1234567890')
      expect(dto.message).toBe('Test message')
      expect(dto.template).toBe('welcome')
      expect(dto.data).toEqual({ name: 'John Doe' })
    })

    it('should have optional customerId property', () => {
      const dto = new SendSmsDto()
      dto.customerId = '1234567890'
      dto.to = '+1234567890'
      dto.message = 'Test message'
      dto.template = 'welcome'
      dto.data = { name: 'John Doe' }

      expect(dto.customerId).toBe('1234567890')
    })
  })
})
