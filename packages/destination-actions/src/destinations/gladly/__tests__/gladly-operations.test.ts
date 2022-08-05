import nock from 'nock'

import { Gladly, API_VERSION } from '../gladly-operations'
import { Settings } from '../generated-types'
import { Customer } from '../gladly-shared-types'
import { HTTPError } from '@segment/actions-core'
import createRequestClient from '../../../../../core/src/create-request-client'

describe('Gladly', () => {
  const settings: Settings = {
    username: 'user',
    password: 'password',
    url: 'https://test-org.us-1.gladly.com'
  }

  const mockRequest = jest.fn()
  const subject = new Gladly(settings, mockRequest)
  const baseUrl = `${settings.url}${API_VERSION}`

  describe('createConversationItem', () => {
    const customerId = '123'
    const title = 'Test Event'
    const body = 'test body for event'
    const sourceName = 'Test'

    describe('with both email and phone', () => {
      const email = 'test@gladly.com'
      const phone = '2345678901'
      const activityType = 'EMAIL'

      it('calls create conversation item endpoint successfully', async () => {
        const result = await subject.createConversationItem(customerId, {
          email,
          phone,
          title,
          body,
          activityType,
          sourceName
        })
        expect(subject.request).toHaveBeenCalledWith(
          'https://test-org.us-1.gladly.com/api/v1/customers/123/conversation-items',
          {
            json: {
              content: {
                activityType: 'EMAIL',
                body,
                sourceName: 'Test',
                title,
                type: 'CUSTOMER_ACTIVITY'
              },
              customer: { emailAddress: email }
            },
            method: 'post'
          }
        )
        expect(result).not.toBeInstanceOf(Error)
      })
    })

    describe('with only email', () => {
      const email = 'test@gladly.com'
      const activityType = 'EMAIL'

      it('calls create conversation item endpoint successfully', async () => {
        const result = await subject.createConversationItem(customerId, {
          email,
          phone: '',
          title,
          body,
          activityType,
          sourceName
        })
        expect(subject.request).toHaveBeenCalledWith(
          'https://test-org.us-1.gladly.com/api/v1/customers/123/conversation-items',
          {
            json: {
              content: {
                activityType: 'EMAIL',
                body,
                sourceName: 'Test',
                title,
                type: 'CUSTOMER_ACTIVITY'
              },
              customer: { emailAddress: email }
            },
            method: 'post'
          }
        )
        expect(result).not.toBeInstanceOf(Error)
      })
    })

    describe('with only phone', () => {
      const phone = '2345678901'
      const activityType = 'SMS'

      it('calls create conversation item endpoint successfully', async () => {
        const result = await subject.createConversationItem(customerId, {
          email: '',
          phone,
          title,
          body,
          activityType,
          sourceName
        })
        expect(subject.request).toHaveBeenCalledWith(
          'https://test-org.us-1.gladly.com/api/v1/customers/123/conversation-items',
          {
            json: {
              content: {
                activityType: 'SMS',
                body,
                sourceName: 'Test',
                title,
                type: 'CUSTOMER_ACTIVITY'
              },
              customer: { mobilePhone: phone }
            },
            method: 'post'
          }
        )
        expect(result).not.toBeInstanceOf(Error)
      })
    })

    describe('when the request is unsuccessful', () => {
      const subject = new Gladly(settings, createRequestClient())

      const email = 'test@gladly.com'
      const phone = '2345678901'
      const activityType = 'EMAIL'

      beforeEach(() => {
        nock(baseUrl).post(`/customers/${customerId}/conversation-items`).reply(400, { error: 'error' })
      })

      it('throws an http error', async () => {
        let response
        try {
          response = await subject.createConversationItem(customerId, {
            email,
            phone,
            title,
            body,
            activityType,
            sourceName
          })
        } catch (e) {
          response = e
        }
        expect(response).toBeInstanceOf(HTTPError)
      })
    })
  })

  describe('createCustomer', () => {
    const name = 'Joe Bob'
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const address = '123 Test St. New York City NY US 10001'
    const customAttributes = {
      tier: 'vip'
    }
    const override = true

    describe('with all fields', () => {
      it('calls create customer endpoint successfully', async () => {
        const response = await subject.createCustomer({ name, email, phone, address, customAttributes, override })
        expect(subject.request).toHaveBeenCalledWith('https://test-org.us-1.gladly.com/api/v1/customer-profiles', {
          json: {
            address,
            customAttributes,
            emails: [{ original: email, primary: false }],
            name,
            phones: [{ original: phone, primary: false }]
          },
          method: 'post'
        })
        expect(response).not.toBeInstanceOf(Error)
      })
    })

    describe('with only email', () => {
      it('calls create customer endpoint successfully', async () => {
        const response = await subject.createCustomer({
          name: '',
          email,
          phone: '',
          address: '',
          customAttributes: {},
          override
        })
        expect(subject.request).toHaveBeenCalledWith('https://test-org.us-1.gladly.com/api/v1/customer-profiles', {
          json: {
            address: '',
            customAttributes: {},
            emails: [{ original: email, primary: false }],
            name: '',
            phones: []
          },
          method: 'post'
        })
        expect(response).not.toBeInstanceOf(Error)
      })
    })

    describe('with only phone', () => {
      it('calls create customer endpoint successfully', async () => {
        const response = await subject.createCustomer({
          name: '',
          email: '',
          phone,
          address: '',
          customAttributes: {},
          override
        })
        expect(subject.request).toHaveBeenCalledWith('https://test-org.us-1.gladly.com/api/v1/customer-profiles', {
          json: {
            address: '',
            customAttributes: {},
            emails: [],
            name: '',
            phones: [{ original: phone, primary: false }]
          },
          method: 'post'
        })
        expect(response).not.toBeInstanceOf(Error)
      })
    })

    describe('when the request is unsuccessful', () => {
      beforeEach(() => {
        nock(baseUrl).post(`/customer-profiles`).reply(400, { error: 'error' })
      })

      it('throws an http error', async () => {
        const subject = new Gladly(settings, createRequestClient())

        let response
        try {
          response = await subject.createCustomer({ name, email, phone, address, customAttributes, override })
        } catch (e) {
          response = e
        }
        expect(response).toBeInstanceOf(HTTPError)
      })
    })
  })

  describe('findCustomerByEmail', () => {
    const email = 'test@gladly.com'

    describe('when the request is successful', () => {
      it('calls the find customer endpoint correctly', async () => {
        const response = await subject.findCustomerByEmail(email)
        expect(subject.request).toHaveBeenCalledWith(
          'https://test-org.us-1.gladly.com/api/v1/customer-profiles?email=test%40gladly.com',
          { method: 'get' }
        )
        expect(response).not.toBeInstanceOf(Error)
      })
    })

    describe('when the request is unsuccessful', () => {
      beforeEach(() => {
        nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(400, { error: 'error' })
      })

      it('throws an http error', async () => {
        const subject = new Gladly(settings, createRequestClient())
        let response
        try {
          response = await subject.findCustomerByEmail(email)
        } catch (e) {
          response = e
        }
        expect(response).toBeInstanceOf(HTTPError)
      })
    })
  })

  describe('findCustomerByPhone', () => {
    const phone = '+12345678901'

    describe('when the request is successful', () => {
      it('calls the find customer endpoint correctly', async () => {
        const response = await subject.findCustomerByPhone(phone)
        expect(subject.request).toHaveBeenCalledWith(
          'https://test-org.us-1.gladly.com/api/v1/customer-profiles?phoneNumber=%2B12345678901',
          { method: 'get' }
        )
        expect(response).not.toBeInstanceOf(Error)
      })
    })

    describe('when the request is unsuccessful', () => {
      beforeEach(() => {
        nock(baseUrl).get(`/customer-profiles`).query({ phoneNumber: phone }).reply(400, { error: 'error' })
      })

      it('throws an http error', async () => {
        const subject = new Gladly(settings, createRequestClient())
        let response
        try {
          response = await subject.findCustomerByPhone(phone)
        } catch (e) {
          response = e
        }
        expect(response).toBeInstanceOf(HTTPError)
      })
    })
  })

  describe('updateCustomer', () => {
    const customer: Customer = {
      id: '123',
      createdAt: '07-11-2022'
    }

    const name = 'Joe Bob'
    const email = 'test1@gladly.com'
    const phone = '2345678902'
    const address = '123 Test St. Houston, TX 77002'
    const customAttributes = {
      tier: 'vip'
    }

    describe('when the request is successful', () => {
      describe('when override is true', () => {
        const override = true

        it('calls the update customer endpoint correctly', async () => {
          const response = await subject.updateCustomer(customer, {
            name,
            email,
            phone,
            address,
            customAttributes,
            override
          })
          expect(subject.request).toHaveBeenCalledWith(
            'https://test-org.us-1.gladly.com/api/v1/customer-profiles/123',
            {
              json: {
                address,
                customAttributes,
                emails: [{ original: email, primary: false }],
                name,
                phones: [{ original: phone, primary: false }]
              },
              method: 'patch'
            }
          )
          expect(response).not.toBeInstanceOf(Error)
        })
      })
    })

    describe('when the request is unsuccessful', () => {
      const override = true
      beforeEach(() => {
        nock(baseUrl).patch(`/customer-profiles/${customer.id}`).reply(400, { error: 'error' })
      })

      it('throws an http error', async () => {
        const subject = new Gladly(settings, createRequestClient())
        let response
        try {
          response = await subject.updateCustomer(customer, {
            name,
            email,
            phone,
            address,
            customAttributes,
            override
          })
        } catch (e) {
          response = e
        }
        expect(response).toBeInstanceOf(HTTPError)
      })
    })
  })

  // describe('createCustomer', () => {
  //   const name = 'Joe Bob'
  //   const email = 'test@gladly.com'
  //   const phone = '2345678901'
  //   const address = '123 Test St. New York City NY US 10001'
  //   const customAttributes = {
  //     tier: 'vip'
  //   }

  //   describe('with all fields', () => {
  //     beforeEach(() => {
  //       nock(baseUrl).post(`/customer-profiles`).reply(201, {})
  //     })

  //     it('call create customer endpoint successfully', async () => {
  //       const response = await whenInvoked(name, email, phone, address, customAttributes)
  //       expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles"`)
  //       expect(response.options.headers).toMatchInlineSnapshot()
  //       expect(response.options.data).toMatchInlineSnapshot()
  //     })
  //   })

  //   describe('with only email', () => {
  //     beforeEach(() => {
  //       nock(baseUrl).post(`/customer-profiles`).reply(201, {})
  //     })

  //     it('call create customer endpoint successfully', async () => {
  //       const response = await whenInvoked('', email, '', '', {})
  //       expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles"`)
  //       expect(response.options.headers).toMatchInlineSnapshot()
  //       expect(response.options.data).toMatchInlineSnapshot()
  //     })
  //   })

  //   describe('with only phone', () => {
  //     beforeEach(() => {
  //       nock(baseUrl).post(`/customer-profiles`).reply(201, {})
  //     })

  //     it('call create customer endpoint successfully', async () => {
  //       const response = await whenInvoked('', '', phone, '', {})
  //       expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles"`)
  //       expect(response.options.headers).toMatchInlineSnapshot()
  //       expect(response.options.data).toMatchInlineSnapshot()
  //     })
  //   })

  //   describe('when the request is unsuccessful', () => {
  //     beforeEach(() => {
  //       nock(baseUrl).post(`/customer-profiles`).reply(400, { error: 'error' })
  //     })

  //     it('throws an http error', async () => {
  //       const response = await whenInvoked(name, email, phone, address, customAttributes)
  //       expect(response).toBeInstanceOf(HTTPError)
  //     })
  //   })

  //   async function whenInvoked(name: string, email: string, phone: string, address: string, customAttributes: object) {
  //     try {
  //       return await subject.createCustomer(name, email, phone, address, customAttributes)
  //     } catch (e) {
  //       return e
  //     }
  //   }
  // })

  // describe('findCustomerByEmail', () => {
  //   const email = 'test@gladly.com'

  //   describe('when the request is successful', () => {
  //     beforeEach(() => {
  //       nock(baseUrl)
  //         .get(`/customer-profiles`)
  //         .query({ email })
  //         .reply(200, [
  //           {
  //             id: '123'
  //           }
  //         ])
  //     })

  //     it('calls the find customer endpoint correctly', async () => {
  //       const response = await whenInvoked()
  //       expect(response.url).toMatchInlineSnapshot(
  //         `"https://test-org.us-1.gladly.com/api/v1/customer-profiles?email=test%40gladly.com"`
  //       )
  //       expect(response.options.headers).toMatchInlineSnapshot()
  //       expect(response.options.data).toMatchInlineSnapshot()
  //     })
  //   })

  //   describe('when the request is unsuccessful', () => {
  //     beforeEach(() => {
  //       nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(400, { error: 'error' })
  //     })

  //     it('throws an http error', async () => {
  //       const response = await whenInvoked()
  //       expect(response).toBeInstanceOf(HTTPError)
  //     })
  //   })

  //   async function whenInvoked() {
  //     try {
  //       return await subject.findCustomerByEmail(email)
  //     } catch (e) {
  //       return e
  //     }
  //   }
  // })

  // describe('findCustomerByPhone', () => {
  //   const phone = '+12345678901'

  //   describe('when the request is successful', () => {
  //     beforeEach(() => {
  //       nock(baseUrl)
  //         .get(`/customer-profiles`)
  //         .query({ phoneNumber: phone })
  //         .reply(200, [
  //           {
  //             id: '123'
  //           }
  //         ])
  //     })

  //     it('calls the find customer endpoint correctly', async () => {
  //       const response = await whenInvoked()
  //       expect(response.url).toMatchInlineSnapshot(
  //         `"https://test-org.us-1.gladly.com/api/v1/customer-profiles?phoneNumber=%2B12345678901"`
  //       )
  //       expect(response.options.headers).toMatchInlineSnapshot()
  //       expect(response.options.data).toMatchInlineSnapshot()
  //     })
  //   })

  //   describe('when the request is unsuccessful', () => {
  //     beforeEach(() => {
  //       nock(baseUrl).get(`/customer-profiles`).query({ phoneNumber: phone }).reply(400, { error: 'error' })
  //     })

  //     it('throws an http error', async () => {
  //       const response = await whenInvoked()
  //       expect(response).toBeInstanceOf(HTTPError)
  //     })
  //   })

  //   async function whenInvoked() {
  //     try {
  //       return await subject.findCustomerByPhone(phone)
  //     } catch (e) {
  //       return e
  //     }
  //   }
  // })

  // describe('updateCustomer', () => {
  //   const customer: Customer = {
  //     id: '123',
  //     createdAt: '07-11-2022'
  //   }
  //   const name = 'Joe Bob'
  //   const address = '123 Test St. Houston, TX 77002'
  //   const customAttributes = {
  //     tier: 'vip'
  //   }

  //   describe('with all fields', () => {
  //     const email = 'test1@gladly.com'
  //     const phone = '2345678902'

  //     beforeEach(() => {
  //       nock(baseUrl).patch(`/customer-profiles/${customer.id}`).reply(204, {})
  //     })

  //     it('calls the update customer endpoint correctly', async () => {
  //       const response = await whenInvoked(email, phone)
  //       expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles/123"`)
  //       expect(response.options.headers).toMatchInlineSnapshot()
  //       expect(response.options.data).toMatchInlineSnapshot()
  //     })
  //   })

  //   describe('when the request is unsuccessful', () => {
  //     const email = 'test1@gladly.com'
  //     const phone = '2345678902'

  //     beforeEach(() => {
  //       nock(baseUrl).patch(`/customer-profiles/${customer.id}`).reply(400, { error: 'error' })
  //     })

  //     it('throws an http error', async () => {
  //       const response = await whenInvoked(email, phone)
  //       expect(response).toBeInstanceOf(HTTPError)
  //     })
  //   })

  //   async function whenInvoked(email: string, phone: string) {
  //     try {
  //       return await subject.updateCustomer(customer, name, email, phone, address, customAttributes)
  //     } catch (e) {
  //       return e
  //     }
  //   }
  // })
})
