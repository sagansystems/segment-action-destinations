import nock from 'nock'
import { createTestEvent, createTestIntegration, HTTPError } from '@segment/actions-core'
import Destination from '../../index'
import { API_VERSION } from '../../gladly-operations'

const testDestination = createTestIntegration(Destination)

const settings = {
  username: 'example@gladly.com',
  password: 'gladly',
  url: 'https://test-org.us-1.gladly.qa'
}

const baseUrl = `${settings.url}${API_VERSION}`

describe('Gladly.customer', () => {
  const email = 'joe.bob@gladly.com'
  const phone = '2345678901'
  const externalCustomerId = '123'

  it('does not find a customer and creates a customer profile', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(200, [])
    nock(baseUrl).get(`/customer-profiles`).query({ phoneNumber: phone }).reply(200, [])
    nock(baseUrl).get(`/customer-profiles`).query({ externalCustomerId }).reply(200, [])

    nock(baseUrl).post(`/customer-profiles`).reply(201, { id: '123' })

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: externalCustomerId,
      traits: {
        name: 'Joe Bob',
        email,
        phone,
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
        customAttributes: { tier: { '@path': '$.traits.tier' } }
      }
    })

    expect(responses.length).toBe(4)
    expect(responses[0].status).toBe(200)
    expect(responses[1].status).toBe(200)
    expect(responses[2].status).toBe(200)
    expect(responses[3].status).toBe(201)
    expect(responses[3].options.body).toMatchInlineSnapshot(
      `"{\\"name\\":\\"Joe Bob\\",\\"address\\":\\"123 Test St. New York City NY US 10001\\",\\"emails\\":[{\\"original\\":\\"joe.bob@gladly.com\\",\\"primary\\":true}],\\"phones\\":[{\\"original\\":\\"2345678901\\",\\"primary\\":true}],\\"externalCustomerId\\":\\"123\\",\\"customAttributes\\":{\\"tier\\":\\"vip\\"}}"`
    )
  })

  it('finds a customer and updates a customer profile', async () => {
    nock(baseUrl)
      .get(`/customer-profiles`)
      .query({ email: email })
      .reply(200, [{ id: '123' }])
    nock(baseUrl).patch(`/customer-profiles/123`).reply(204, {})

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: externalCustomerId,
      traits: {
        name: 'Joe Bob',
        email,
        phone,
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
        customAttributes: { tier: { '@path': '$.traits.tier' } }
      }
    })

    expect(responses.length).toBe(2)
    expect(responses[0].status).toBe(200)
    expect(responses[1].status).toBe(204)
    expect(responses[1].options.body).toMatchInlineSnapshot(
      `"{\\"name\\":\\"Joe Bob\\",\\"address\\":\\"123 Test St. New York City NY US 10001\\",\\"emails\\":[{\\"original\\":\\"joe.bob@gladly.com\\",\\"primary\\":true}],\\"phones\\":[{\\"original\\":\\"2345678901\\",\\"primary\\":true}],\\"externalCustomerId\\":\\"123\\",\\"customAttributes\\":{\\"tier\\":\\"vip\\"}}"`
    )
  })

  it('throws http error when find customer fails', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(400)

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: externalCustomerId,
      traits: {
        name: 'Joe Bob',
        email,
        phone,
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
          customAttributes: { tier: { '@path': '$.traits.tier' } }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(HTTPError)
  })

  it('throws http error when create customer fails', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(200, [])
    nock(baseUrl).get(`/customer-profiles`).query({ phoneNumber: phone }).reply(200, [])
    nock(baseUrl).get(`/customer-profiles`).query({ externalCustomerId }).reply(200, [])

    nock(baseUrl).post(`/customer-profiles`).reply(400)

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: externalCustomerId,
      traits: {
        name: 'Joe Bob',
        email,
        phone,
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
          customAttributes: { tier: { '@path': '$.traits.tier' } }
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
      .query({ email })
      .reply(200, [
        {
          id: '123'
        }
      ])
    nock(baseUrl).patch(`/customer-profiles/123`).reply(400)

    const event = createTestEvent({
      type: 'identify',
      event: 'Test Event',
      userId: externalCustomerId,
      traits: {
        name: 'Joe Bob',
        email,
        phone,
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
          customAttributes: { tier: { '@path': '$.traits.tier' } }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(HTTPError)
  })
})
