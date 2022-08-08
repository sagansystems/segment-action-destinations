import { mappings } from '../gladly-mappings'
import { CustomAttributes, Customer, Email, Phone } from '../gladly-shared-types'
import type { Payload as ConversationItemPayload } from '../conversationItem/generated-types'
import type { Payload as CustomerPayload } from '../customer/generated-types'

type CustomerResponse = {
  name?: string
  address?: string
  emails?: Email[]
  phones?: Phone[]
  customAttributes?: CustomAttributes
}

describe('Gladly Mappings', () => {
  describe('generateConversationItemJSON', () => {
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const title = 'Test Event'
    const body = 'test event body'
    const activityType = 'EMAIL'
    const sourceName = 'Test'

    it('formats using email when both email and phone are passed', () => {
      const request: ConversationItemPayload = {
        email,
        phone,
        title,
        body,
        activityType,
        sourceName
      }

      const response = mappings.conversationItem(request)

      expect(response).toStrictEqual({
        customer: {
          emailAddress: email
        },
        content: {
          type: 'CUSTOMER_ACTIVITY',
          title,
          body,
          activityType: 'EMAIL',
          sourceName: 'Test'
        }
      })
    })

    it('formats the message with email', () => {
      const request: ConversationItemPayload = {
        email,
        title,
        body,
        activityType,
        sourceName
      }

      const response = mappings.conversationItem(request)

      expect(response).toStrictEqual({
        customer: {
          emailAddress: email
        },
        content: {
          type: 'CUSTOMER_ACTIVITY',
          title,
          body,
          activityType: 'EMAIL',
          sourceName: 'Test'
        }
      })
    })

    it('formats the message with phone', () => {
      const request: ConversationItemPayload = {
        phone,
        title,
        body,
        activityType: 'SMS',
        sourceName
      }

      const response = mappings.conversationItem(request)

      expect(response).toStrictEqual({
        customer: {
          mobilePhone: phone
        },
        content: {
          type: 'CUSTOMER_ACTIVITY',
          title,
          body,
          activityType: 'SMS',
          sourceName: 'Test'
        }
      })
    })
  })

  describe('generateCreateCustomerJSON', () => {
    const name = 'Joe Bob'
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const address = `100 Test St. New York City NY US 10001`
    const customAttributes = {
      attribute: 'test'
    }
    const override = false

    describe('when all fields are passed', () => {
      const request: CustomerPayload = {
        name,
        email,
        phone,
        address,
        customAttributes,
        override
      }

      const response = mappings.createCustomer(request)

      it('returns customer name', () => {
        expect(response.name).toBe(name)
      })

      it('returns customer email', () => {
        expect(response.emails).toStrictEqual([{ original: 'test@gladly.com', primary: false }])
      })

      it('returns customer phone', () => {
        expect(response.phones).toStrictEqual([{ original: '2345678901', primary: false }])
      })

      it('returns customer address', () => {
        expect(response.address).toBe(address)
      })

      it('returns customer custom attributes', () => {
        expect(response.customAttributes).toStrictEqual({ attribute: 'test' })
      })
    })

    describe('when only override is passed', function () {
      const request: CustomerPayload = {
        override
      }

      const response = mappings.createCustomer(request)

      itDoesNotReturnCustomerAttributes(response)
    })
  })

  describe('generateUpdateCustomerJSON', () => {
    const name = 'Joe Bob'
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const address = `100 Test St. New York City NY US 10001`
    const customAttributes = {
      attribute: 'test'
    }

    const customer: Customer = {
      id: '123',
      name: 'Jane Smith',
      emails: [{ original: 'janesmith@gladly.com' }],
      phones: [{ original: '4567879012' }],
      address: '333 Example Ave. Houston TX US 77002',
      customAttributes: {
        test: 'example'
      },
      createdAt: '07-10-22'
    }

    describe('when override is true', () => {
      const override = true

      const request: CustomerPayload = {
        name,
        email,
        phone,
        address,
        customAttributes,
        override
      }
      const response = mappings.updateCustomer(customer, request)

      it('returns customer name', () => {
        expect(response.name).toBe(name)
      })

      it('returns customer email', () => {
        expect(response.emails).toStrictEqual([
          { original: 'janesmith@gladly.com' },
          { original: email, primary: false }
        ])
      })

      it('returns customer phone', () => {
        expect(response.phones).toStrictEqual([{ original: '4567879012' }, { original: phone, primary: false }])
      })

      it('returns customer address', () => {
        expect(response.address).toBe(address)
      })

      it('returns customer custom attributes', () => {
        expect(response.customAttributes).toStrictEqual({ test: 'example', attribute: 'test' })
      })
    })

    describe('when overide is false', () => {
      const override = false

      const request: CustomerPayload = {
        name,
        email,
        phone,
        address,
        customAttributes,
        override
      }
      const response = mappings.updateCustomer(customer, request)

      itDoesNotReturnCustomerAttributes(response)
    })

    describe('when only override is passed', function () {
      const override = true

      const request: CustomerPayload = {
        override
      }

      const response = mappings.updateCustomer(customer, request)

      itDoesNotReturnCustomerAttributes(response)
    })
  })

  function itDoesNotReturnCustomerAttributes(response: CustomerResponse) {
    it('does not return customer name', () => {
      expect(response.name).not.toBeDefined()
    })

    it('does not return customer email', () => {
      expect(response.emails).not.toBeDefined()
    })

    it('does not return customer phone', () => {
      expect(response.phones).not.toBeDefined()
    })

    it('does not return customer address', () => {
      expect(response.address).not.toBeDefined()
    })

    it('does not return customer custom attributes', () => {
      expect(response.customAttributes).not.toBeDefined()
    })
  }
})
