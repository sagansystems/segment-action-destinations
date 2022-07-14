import nock from 'nock'
import { Gladly, API_VERSION } from '../gladly-operations'
import { Settings } from '../generated-types'
import { GenericPayload, Customer } from '../gladly-types'
import { HTTPError, IntegrationError } from '@segment/actions-core'
import createRequestClient from '../../../../../core/src/create-request-client'

describe('Gladly', () => {
  const settings: Settings = {
    username: 'user',
    password: 'password',
    orgName: 'test-org',
    isSandbox: false
  }
  const request = createRequestClient()

  const subject = new Gladly(settings, request)
  const baseUrl = `https://${settings.orgName}.us-1.gladly.com${API_VERSION}`

  describe('createConversationItem', () => {
    const customerId = '123'

    const email = 'test@gladly.com'
    const phone = '2345678901'
    const title = 'Test Event'
    const body = 'test body for event'

    it('returns a successful response with email and phone', async () => {
      const payload: GenericPayload = {
        email,
        phone,
        title,
        body
      }
      nock(baseUrl).post(`/customers/${customerId}/conversation-items`).reply(200, {})

      const response = await subject.createConversationItem(customerId, payload)

      expect(response.url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customers/123/conversation-items"`
      )
      expect(response.status).toMatchInlineSnapshot(`200`)
      expect(response.data).toStrictEqual({})
    })
    it('returns a successful response with only email', async () => {
      const payload: GenericPayload = {
        email,
        title,
        body
      }
      nock(baseUrl).post(`/customers/${customerId}/conversation-items`).reply(200, {})

      const response = await subject.createConversationItem(customerId, payload)

      expect(response.url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customers/123/conversation-items"`
      )
      expect(response.status).toMatchInlineSnapshot(`200`)
      expect(response.data).toStrictEqual({})
    })
    it('returns a successful response with only phone', async () => {
      const payload: GenericPayload = {
        phone,
        title,
        body
      }
      nock(baseUrl).post(`/customers/${customerId}/conversation-items`).reply(200, {})

      const response = await subject.createConversationItem(customerId, payload)

      expect(response.url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customers/123/conversation-items"`
      )
      expect(response.status).toMatchInlineSnapshot(`200`)
      expect(response.data).toStrictEqual({})
    })
    it('throws integration error when email and phone are not included', async () => {
      const payload: GenericPayload = {
        title,
        body
      }

      let response, error
      try {
        response = await subject.createConversationItem(customerId, payload)
      } catch (e) {
        error = e
      }
      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(IntegrationError)
    })
    it('throws http error when status code is not 2xx', async () => {
      const payload: GenericPayload = {
        email,
        title,
        body
      }
      nock(baseUrl).post(`/customers/${customerId}/conversation-items`).reply(400, { error: 'error' })

      let response, error
      try {
        response = await subject.createConversationItem(customerId, payload)
      } catch (e) {
        error = e
      }
      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(HTTPError)
    })
  })
  describe('createCustomer', () => {
    const name = 'Joe Bob'
    const email = 'test@gladly.com'
    const phone = '2345678901'
    const address = '123 Test St. New York City NY US 10001'
    const externalCustomerId = '123'
    const customAttributes = {
      tier: 'vip'
    }

    it('returns a successful response with email and phone', async () => {
      const payload: GenericPayload = {
        name,
        email,
        phone,
        address,
        externalCustomerId,
        customAttributes
      }
      nock(baseUrl).post(`/customer-profiles`).reply(201, {})

      const response = await subject.createCustomer(payload)

      expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles"`)
      expect(response.status).toMatchInlineSnapshot(`201`)
      expect(response.data).toStrictEqual({})
    })

    it('returns a successful response with only email', async () => {
      const payload: GenericPayload = {
        name,
        email,
        address,
        externalCustomerId,
        customAttributes
      }
      nock(baseUrl).post(`/customer-profiles`).reply(201, {})

      const response = await subject.createCustomer(payload)

      expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles"`)
      expect(response.status).toMatchInlineSnapshot(`201`)
      expect(response.data).toStrictEqual({})
    })

    it('returns a successful response with only phone', async () => {
      const payload: GenericPayload = {
        name,
        phone,
        address,
        externalCustomerId,
        customAttributes
      }
      nock(baseUrl).post(`/customer-profiles`).reply(201, {})

      const response = await subject.createCustomer(payload)

      expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles"`)
      expect(response.status).toMatchInlineSnapshot(`201`)
      expect(response.data).toStrictEqual({})
    })

    it('throws integration error when email and phone are not included', async () => {
      const payload: GenericPayload = {
        name,
        address,
        externalCustomerId,
        customAttributes
      }

      let response, error
      try {
        response = await subject.createCustomer(payload)
      } catch (e) {
        error = e
      }

      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(IntegrationError)
    })

    it('throws http error when status code is not 2xx', async () => {
      const payload: GenericPayload = {
        name,
        email,
        phone,
        address,
        externalCustomerId,
        customAttributes
      }
      nock(baseUrl).post(`/customer-profiles`).reply(400, { error: 'error' })

      let response, error
      try {
        response = await subject.createCustomer(payload)
      } catch (e) {
        error = e
      }

      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(HTTPError)
    })
  })
  describe('findCustomer', () => {
    const email = 'test@gladly.com'
    const phone = '+12345678901'
    it('returns a successful response with email and phone', async () => {
      const payload: GenericPayload = {
        email,
        phone
      }
      nock(baseUrl)
        .get(`/customer-profiles`)
        .query({ email })
        .reply(200, [
          {
            id: '123'
          }
        ])

      const response = await subject.findCustomer(payload)

      expect(response.url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customer-profiles?email=test%40gladly.com"`
      )
      expect(response.status).toMatchInlineSnapshot(`200`)
      expect(response.data).toStrictEqual([{ id: '123' }])
    })

    it('returns a successful response with only email', async () => {
      const payload: GenericPayload = {
        email
      }
      nock(baseUrl)
        .get(`/customer-profiles`)
        .query({ email })
        .reply(200, [
          {
            id: '123'
          }
        ])

      const response = await subject.findCustomer(payload)

      expect(response.url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customer-profiles?email=test%40gladly.com"`
      )
      expect(response.status).toMatchInlineSnapshot(`200`)
      expect(response.data).toStrictEqual([{ id: '123' }])
    })

    it('returns a successful response with only phone', async () => {
      const payload: GenericPayload = {
        phone
      }
      nock(baseUrl)
        .get(`/customer-profiles`)
        .query({ phoneNumber: phone })
        .reply(200, [
          {
            id: '123'
          }
        ])

      const response = await subject.findCustomer(payload)

      expect(response.url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customer-profiles?phoneNumber=%2B12345678901"`
      )
      expect(response.status).toMatchInlineSnapshot(`200`)
      expect(response.data).toStrictEqual([{ id: '123' }])
    })

    it('throws an integration error when email and phone are not included', async () => {
      const payload: GenericPayload = {}

      let response, error
      try {
        response = await subject.findCustomer(payload)
      } catch (e) {
        error = e
      }

      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(IntegrationError)
    })
    it('throws a http error when status is not 2xx', async () => {
      const payload: GenericPayload = {
        email
      }
      nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(400, { error: 'error' })

      let response, error
      try {
        response = await subject.findCustomer(payload)
      } catch (e) {
        error = e
      }

      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(HTTPError)
    })
  })
  describe('updateCustomer', () => {
    const email = 'test1@gladly.com'
    const phone = '2345678902'
    const customerId = '123'

    const customer: Customer = {
      id: customerId,
      createdAt: '07-11-2022'
    }
    it('returns a successful response with email and phone', async () => {
      const payload: GenericPayload = {
        email,
        phone
      }
      nock(baseUrl).patch(`/customer-profiles/${customerId}`).reply(204, {})

      const response = await subject.updateCustomer(customer, payload)

      expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles/123"`)
      expect(response.status).toMatchInlineSnapshot(`204`)
      expect(response.data).toStrictEqual({})
    })
    it('returns a successful response with only email', async () => {
      const payload: GenericPayload = {
        email
      }
      nock(baseUrl).patch(`/customer-profiles/${customerId}`).reply(204, {})

      const response = await subject.updateCustomer(customer, payload)

      expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles/123"`)
      expect(response.status).toMatchInlineSnapshot(`204`)
      expect(response.data).toStrictEqual({})
    })
    it('returns a successful response with only phone', async () => {
      const payload: GenericPayload = {
        phone
      }
      nock(baseUrl).patch(`/customer-profiles/${customerId}`).reply(204, {})

      const response = await subject.updateCustomer(customer, payload)

      expect(response.url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.com/api/v1/customer-profiles/123"`)
      expect(response.status).toMatchInlineSnapshot(`204`)
      expect(response.data).toStrictEqual({})
    })

    it('throws an integration error when email and phone are not included', async () => {
      const payload: GenericPayload = {}

      let response, error
      try {
        response = await subject.updateCustomer(customer, payload)
      } catch (e) {
        error = e
      }

      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(IntegrationError)
    })

    it('throws HTTP Error when status code is not 2xx', async () => {
      const payload: GenericPayload = {
        email,
        phone
      }
      nock(baseUrl).patch(`/customer-profiles/${customerId}`).reply(400, { error: 'error' })

      let response, error
      try {
        response = await subject.updateCustomer(customer, payload)
      } catch (e) {
        error = e
      }

      expect(response).not.toBeDefined()
      expect(error).toBeInstanceOf(HTTPError)
    })
  })
})
