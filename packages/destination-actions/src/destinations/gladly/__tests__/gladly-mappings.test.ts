import { mappings } from '../gladly-mappings'
import { Customer, GenericPayload } from '../gladly-shared-types'

describe('Gladly Mappings', () => {
  describe('generateConversationItemJSON', () => {
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const title = 'Test Event'
    const body = 'test event body'

    it('formats using email when both email and phone are passed', () => {
      const request: GenericPayload = {
        email,
        phone,
        title,
        body
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
          sourceName: 'Segment'
        }
      })
    })

    it('formats the message correctly with email', () => {
      const request: GenericPayload = {
        email,
        title,
        body
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
          sourceName: 'Segment'
        }
      })
    })

    it('formats the message correctly with phone', () => {
      const request: GenericPayload = {
        phone,
        title,
        body
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
          sourceName: 'Segment'
        }
      })
    })
  })

  describe('generateCreateCustomerJSON', () => {
    const name = 'Joe Bob'
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const address = `100 Test St. New York City NY US 10001`
    const externalCustomerId = '123'
    const customAttributes = {
      attribute: 'test'
    }

    it('returns customer with all fields formatted', () => {
      const request: GenericPayload = {
        name,
        email,
        phone,
        address,
        externalCustomerId,
        customAttributes
      }
      const response = mappings.createCustomer(request)
      expect(response).toStrictEqual({
        name,
        address,
        emails: [
          {
            original: email,
            primary: true
          }
        ],
        phones: [
          {
            original: phone,
            primary: true
          }
        ],
        externalCustomerId,
        customAttributes
      })
    })

    it('returns customer with formatted email and no phone', () => {
      const request: GenericPayload = {
        name,
        email,
        address,
        externalCustomerId,
        customAttributes
      }
      const response = mappings.createCustomer(request)
      expect(response).toStrictEqual({
        name,
        address,
        emails: [
          {
            original: email,
            primary: true
          }
        ],
        phones: [],
        externalCustomerId,
        customAttributes
      })
    })

    it('returns customer with formatted phone and no email', () => {
      const request: GenericPayload = {
        name,
        phone,
        address,
        externalCustomerId,
        customAttributes
      }
      const response = mappings.createCustomer(request)
      expect(response).toStrictEqual({
        name,
        address,
        emails: [],
        phones: [
          {
            original: phone,
            primary: true
          }
        ],
        externalCustomerId,
        customAttributes
      })
    })

    it('returns customer with just external customer id', () => {
      const request: GenericPayload = {
        externalCustomerId
      }
      const response = mappings.createCustomer(request)
      expect(response).toStrictEqual({
        name: '',
        address: '',
        emails: [],
        phones: [],
        externalCustomerId,
        customAttributes: {}
      })
    })
  })

  describe('generateUpdateCustomerJSON', () => {
    const name = 'Joe Bob'
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const address = `100 Test St. New York City NY US 10001`
    const externalCustomerId = '123'
    const customAttributes = {
      attribute: 'test'
    }

    describe('when customer has data to update', () => {
      const customer: Customer = {
        id: '123',
        name: 'Jane Smith',
        emails: [{ original: 'janesmith@gladly.com' }],
        phones: [{ original: '4567879012' }],
        address: '333 Example Ave. Houston TX US 77002',
        externalCustomerId: '456',
        customAttributes: {
          test: 'example'
        },
        createdAt: '07-10-22'
      }

      it('updates customer name', () => {
        const request: GenericPayload = {
          name
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.name).toBe(name)
      })

      it('updates customer email', () => {
        const request: GenericPayload = {
          email
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.emails).toStrictEqual([{ original: 'janesmith@gladly.com' }, { original: email }])
      })

      it('updates customer phone', () => {
        const request: GenericPayload = {
          phone
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.phones).toStrictEqual([{ original: '4567879012' }, { original: phone }])
      })

      it('updates customer address', () => {
        const request: GenericPayload = {
          address
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.address).toBe(address)
      })

      it('updates customer external customer id', () => {
        const request: GenericPayload = {
          externalCustomerId
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.externalCustomerId).toBe(externalCustomerId)
      })

      it('updates customer custom attributes', () => {
        const request: GenericPayload = {
          customAttributes
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.customAttributes).toStrictEqual({ test: 'example', attribute: 'test' })
      })
    })

    describe('when customer does not have data to update', () => {
      const customer: Customer = {
        id: '123',
        createdAt: '07-10-22'
      }

      it('updates customer name', () => {
        const request: GenericPayload = {
          name
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.name).toBe(name)
      })

      it('updates customer email', () => {
        const request: GenericPayload = {
          email
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.emails).toStrictEqual([{ original: email, primary: true }])
      })

      it('updates customer phone', () => {
        const request: GenericPayload = {
          phone
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.phones).toStrictEqual([{ original: phone, primary: true }])
      })

      it('updates customer address', () => {
        const request: GenericPayload = {
          address
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.address).toBe(address)
      })

      it('updates customer external customer id', () => {
        const request: GenericPayload = {
          externalCustomerId
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.externalCustomerId).toBe(externalCustomerId)
      })

      it('updates customer custom attributes', () => {
        const request: GenericPayload = {
          customAttributes
        }
        const response = mappings.updateCustomer(customer, request)
        expect(response.customAttributes).toStrictEqual({ attribute: 'test' })
      })
    })
  })
})
