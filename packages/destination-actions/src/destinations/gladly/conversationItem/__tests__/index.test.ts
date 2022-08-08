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

describe('ConversationItem', () => {
  const customerEmail = 'test@example.com'
  const event = createTestEvent({
    type: 'track',
    event: 'Test Event',
    properties: {
      body: 'Test Body',
      email: customerEmail
    }
  })

  describe('when a conversation item is successfully created', () => {
    beforeEach(async () => {
      nock(baseUrl)
        .get(`/customer-profiles`)
        .query({ email: customerEmail })
        .reply(200, [
          {
            id: '123'
          }
        ])
      nock(baseUrl).post(`/customers/123/conversation-items`).reply(200, {})
    })

    it('call find customer correctly', async () => {
      const response = await whenInvoked()

      expect(response[0].url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customer-profiles?email=test%40example.com"`
      )
      expect(response[0].options.headers).toMatchInlineSnapshot(`
        Headers {
          Symbol(map): Object {
            "authorization": Array [
              "Basic ZXhhbXBsZUBnbGFkbHkuY29tOmdsYWRseQ==",
            ],
            "user-agent": Array [
              "Segment (Actions)",
            ],
          },
        }
      `)
    })

    it('calls create conversation correctly', async () => {
      const response = await whenInvoked()

      expect(response[1].url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.com/api/v1/customers/123/conversation-items"`
      )
      expect(response[1].options.headers).toMatchInlineSnapshot(`
      Headers {
        Symbol(map): Object {
          "authorization": Array [
            "Basic ZXhhbXBsZUBnbGFkbHkuY29tOmdsYWRseQ==",
          ],
          "user-agent": Array [
            "Segment (Actions)",
          ],
        },
      }
    `)
      expect(response[1].options.body).toMatchInlineSnapshot(
        `"{\\"customer\\":{\\"emailAddress\\":\\"test@example.com\\"},\\"content\\":{\\"type\\":\\"CUSTOMER_ACTIVITY\\",\\"title\\":\\"Test Event\\",\\"body\\":\\"Test Body\\",\\"activityType\\":\\"EMAIL\\",\\"sourceName\\":\\"Segment\\"}}"`
      )
    })
  })

  describe('when a customer does not exist', () => {
    beforeEach(() => {
      nock(baseUrl).get(`/customer-profiles`).query({ email: customerEmail }).reply(200, [])
    })

    it('throws an integration error', async () => {
      const response = await whenInvoked()

      expect(response).toBeInstanceOf(IntegrationError)
    })
  })

  describe('when the find customer response is not 200', () => {
    beforeEach(() => {
      nock(baseUrl).get(`/customer-profiles`).query({ email: customerEmail }).reply(400, [])
    })

    it('throws a http error', async () => {
      const response = await whenInvoked()

      expect(response).toBeInstanceOf(HTTPError)
    })
  })

  describe('when create conversation is unsuccessful', () => {
    beforeEach(() => {
      nock(baseUrl)
        .get(`/customer-profiles`)
        .query({ email: customerEmail })
        .reply(200, [
          {
            id: '123'
          }
        ])
      nock(baseUrl).post(`/customers/123/conversation-items`).reply(400, {})
    })

    it('throws a http error', async () => {
      const response = await whenInvoked()

      expect(response).toBeInstanceOf(HTTPError)
    })
  })

  async function whenInvoked() {
    try {
      return await testDestination.testAction('conversationItem', {
        event,
        settings,
        mapping: {
          email: { '@path': '$.properties.email' },
          title: { '@path': '$.event' },
          body: { '@path': '$.properties.body' },
          activityType: 'EMAIL',
          sourceName: 'Segment'
        }
      })
    } catch (e) {
      return e
    }
  }
})
