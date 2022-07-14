import nock from 'nock'
import { createTestEvent, createTestIntegration, IntegrationError, HTTPError } from '@segment/actions-core'
import Destination from '../../index'
import { API_VERSION } from '../../gladly-operations'

const testDestination = createTestIntegration(Destination)

const settings = {
  username: 'example@gladly.com',
  password: 'gladly',
  url: 'https://test-org.us-1.gladly.com'
}

const baseUrl = `${settings.url}${API_VERSION}`

describe('Gladly.conversationItem', () => {
  const externalCustomerId = '123'

  it('creates a conversation item', async () => {
    nock(baseUrl)
      .get(`/customer-profiles`)
      .query({ externalCustomerId })
      .reply(200, [
        {
          id: '123'
        }
      ])
    nock(baseUrl).post(`/customers/123/conversation-items`).reply(200, {})

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: externalCustomerId,
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
    expect(responses[1].options.body).toMatchInlineSnapshot(
      `"{\\"customer\\":{},\\"content\\":{\\"type\\":\\"CUSTOMER_ACTIVITY\\",\\"title\\":\\"Test Event\\",\\"body\\":\\"Test Body\\",\\"activityType\\":\\"SMS\\",\\"sourceName\\":\\"Segment\\"}}"`
    )
  })

  it('throws integration error when customer does not exist', async () => {
    nock(baseUrl).get(`/customer-profiles`).query({ externalCustomerId }).reply(200, [])

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: externalCustomerId,
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
    nock(baseUrl).get(`/customer-profiles`).query({ externalCustomerId }).reply(400, [])

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: externalCustomerId,
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
      .query({ externalCustomerId })
      .reply(200, [
        {
          id: '123'
        }
      ])
    nock(baseUrl).post(`/customers/123/conversation-items`).reply(400, {})

    const event = createTestEvent({
      type: 'track',
      event: 'Test Event',
      userId: externalCustomerId,
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
})
