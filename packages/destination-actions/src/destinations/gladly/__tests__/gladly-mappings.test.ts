import { mappings } from '../gladly-mappings'
import { GenericPayload } from '../gladly-types'

fdescribe('Gladly Mappings', () => {
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
  fdescribe('generateCreateCustomerJSON', () => {
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
    // const name = 'Joe Bob'
    // const email = 'test@gladly.com'
    // const phone = '2345678901'
    // const address = `100 Test St. New York City NY US 10001`
    // const externalCustomerId = '123'
    // const customAttributes = {
    //   attribute: 'test'
    // }
    describe('email', () => {})
  })
})
