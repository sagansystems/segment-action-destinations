import nock from 'nock'
import { createTestEvent, createTestIntegration, HTTPError, IntegrationError } from '@segment/actions-core'
import Destination from '../../index'
import { API_VERSION } from '../../gladly-operations'

const testDestination = createTestIntegration(Destination)

const settings = {
  username: 'example@gladly.com',
  password: 'gladly',
  orgName: 'test-org',
  isSandbox: false
}

const baseUrl = `https://${settings.orgName}.us-1.gladly.com${API_VERSION}`

describe('Gladly.customer', () => {
  const testCustomerEmail = 'joe.bob@gladly.com'
  const customerId = '123'

  it('does not find a customer and creates a customer profile', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ email: testCustomerEmail }).reply(200, [])
    nock(baseUrl).post(`/customer-profiles`).reply(201, {})

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: '123',
      traits: {
        name: 'Joe Bob',
        email: testCustomerEmail,
        phone: '2345678901',
        address: '123 Test St. New York City NY US 10001',
        tier: 'vip'
      }
    })

    const responses = await testDestination.testAction('customer', {
      event,
      settings,
      mapping: {
        name: { '@path': '$.traits.name' },
        email: { '@path': '$.traits.email' },
        phone: { '@path': '$.traits.phone' },
        externalCustomerId: { '@path': '$.userId' },
        address: { '@path': '$.traits.address' },
        customAttributes: { tier: { '@path': '$.traits.address.country' } }
      }
    })

    expect(responses.length).toBe(2)
    expect(responses[0].status).toBe(200)
    expect(responses[1].status).toBe(201)
  })

  it('finds a customer and updates a customer profile', async () => {
    nock(baseUrl)
      .get(`/customer-profiles`)
      .query({ email: testCustomerEmail })
      .reply(200, [{ id: customerId }])
    nock(baseUrl).patch(`/customer-profiles/${customerId}`).reply(204, {})

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: '123',
      traits: {
        name: 'Joe Bob',
        email: testCustomerEmail,
        phone: '2345678901',
        address: '123 Test St. New York City NY US 10001',
        tier: 'vip'
      }
    })

    const responses = await testDestination.testAction('customer', {
      event,
      settings,
      mapping: {
        name: { '@path': '$.traits.name' },
        email: { '@path': '$.traits.email' },
        phone: { '@path': '$.traits.phone' },
        externalCustomerId: { '@path': '$.userId' },
        address: { '@path': '$.traits.address' },
        customAttributes: { tier: { '@path': '$.traits.address.country' } }
      }
    })

    expect(responses.length).toBe(2)
    expect(responses[0].status).toBe(200)
    expect(responses[1].status).toBe(204)
  })
  it('throws http error when find customer fails', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ email: testCustomerEmail }).reply(400)

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: '123',
      traits: {
        name: 'Joe Bob',
        email: testCustomerEmail,
        phone: '2345678901',
        address: '123 Test St. New York City NY US 10001',
        tier: 'vip'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('customer', {
        event,
        settings,
        mapping: {
          name: { '@path': '$.traits.name' },
          email: { '@path': '$.traits.email' },
          phone: { '@path': '$.traits.phone' },
          externalCustomerId: { '@path': '$.userId' },
          address: { '@path': '$.traits.address' },
          customAttributes: { tier: { '@path': '$.traits.address.country' } }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(HTTPError)
  })
  it('throws http error when create customer fails', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ email: testCustomerEmail }).reply(200, [])
    nock(baseUrl).post(`/customer-profiles`).reply(400)

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: '123',
      traits: {
        name: 'Joe Bob',
        email: testCustomerEmail,
        phone: '2345678901',
        address: '123 Test St. New York City NY US 10001',
        tier: 'vip'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('customer', {
        event,
        settings,
        mapping: {
          name: { '@path': '$.traits.name' },
          email: { '@path': '$.traits.email' },
          phone: { '@path': '$.traits.phone' },
          externalCustomerId: { '@path': '$.userId' },
          address: { '@path': '$.traits.address' },
          customAttributes: { tier: { '@path': '$.traits.address.country' } }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(HTTPError)
  })
  it('throws http error when update customer fails', async () => {
    nock(baseUrl)
      .get(`/customer-profiles`)
      .query({ email: testCustomerEmail })
      .reply(200, [
        {
          id: '123'
        }
      ])
    nock(baseUrl).patch(`/customer-profiles/${customerId}`).reply(400)

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: '123',
      traits: {
        name: 'Joe Bob',
        email: testCustomerEmail,
        phone: '2345678901',
        address: '123 Test St. New York City NY US 10001',
        tier: 'vip'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('customer', {
        event,
        settings,
        mapping: {
          name: { '@path': '$.traits.name' },
          email: { '@path': '$.traits.email' },
          phone: { '@path': '$.traits.phone' },
          externalCustomerId: { '@path': '$.userId' },
          address: { '@path': '$.traits.address' },
          customAttributes: { tier: { '@path': '$.traits.address.country' } }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(HTTPError)
  })
  it('throws integration error when email, phone and external customer id is not included', async () => {
    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      traits: {
        name: 'Joe Bob',
        address: '123 Test St. New York City NY US 10001',
        tier: 'vip'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('customer', {
        event,
        settings,
        mapping: {
          name: { '@path': '$.traits.name' },
          address: { '@path': '$.traits.address' },
          customAttributes: { tier: { '@path': '$.traits.address.country' } }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(IntegrationError)
  })
})
