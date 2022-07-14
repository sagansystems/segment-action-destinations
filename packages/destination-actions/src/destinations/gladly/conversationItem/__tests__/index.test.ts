import nock from 'nock'
import { createTestEvent, createTestIntegration, IntegrationError, HTTPError } from '@segment/actions-core'
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

describe('Gladly.conversationItem', () => {
  const testCustomerId = '123'

  it('creates a conversation item', async () => {
    nock(baseUrl)
      .get(`/customer-profiles`)
      .query({ externalCustomerId: testCustomerId })
      .reply(200, [
        {
          id: testCustomerId
        }
      ])
    nock(baseUrl).post(`/customers/${testCustomerId}/conversation-items`).reply(200, {})

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: testCustomerId,
      properties: {
        body: 'Test Body'
      }
    })

    const responses = await testDestination.testAction('conversationItem', {
      event,
      settings,
      mapping: {
        externalCustomerId: { '@path': '$.userId' },
        title: { '@path': '$.event' },
        body: { '@path': '$.properties.body' }
      }
    })

    expect(responses.length).toBe(2)
    expect(responses[0].status).toBe(200)
    expect(responses[1].status).toBe(200)
  })
  it('throws integration error when customer does not exist', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ externalCustomerId: testCustomerId }).reply(200, [])

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: testCustomerId,
      properties: {
        body: 'Test Body'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('conversationItem', {
        event,
        settings,
        mapping: {
          externalCustomerId: { '@path': '$.userId' },
          title: { '@path': '$.event' },
          body: { '@path': '$.properties.body' }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(IntegrationError)
  })
  it('throws http error when find customer response is not 200', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ externalCustomerId: testCustomerId }).reply(400, [])

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: testCustomerId,
      properties: {
        body: 'Test Body'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('conversationItem', {
        event,
        settings,
        mapping: {
          externalCustomerId: { '@path': '$.userId' },
          title: { '@path': '$.event' },
          body: { '@path': '$.properties.body' }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(HTTPError)
  })
  it('throws http error when create conversation item is not 200', async () => {
    nock(baseUrl)
      .get(`/customer-profiles`)
      .query({ externalCustomerId: testCustomerId })
      .reply(200, [
        {
          id: testCustomerId
        }
      ])
    nock(baseUrl).post(`/customers/${testCustomerId}/conversation-items`).reply(400, {})

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: testCustomerId,
      properties: {
        body: 'Test Body'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('conversationItem', {
        event,
        settings,
        mapping: {
          externalCustomerId: { '@path': '$.userId' },
          title: { '@path': '$.event' },
          body: { '@path': '$.properties.body' }
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
      type: 'track',
      event: 'Test Event',
      properties: {
        body: 'Test Body'
      }
    })

    let response, error
    try {
      response = await testDestination.testAction('conversationItem', {
        event,
        settings,
        mapping: {
          title: { '@path': '$.event' },
          body: { '@path': '$.properties.body' }
        }
      })
    } catch (e) {
      error = e
    }

    expect(response).toBeUndefined()
    expect(error).toBeInstanceOf(IntegrationError)
  })
})
