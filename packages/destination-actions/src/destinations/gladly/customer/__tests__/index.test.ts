import nock from 'nock'
import { createTestEvent, createTestIntegration, HTTPError } from '@segment/actions-core'
import Destination from '../../index'
import { API_VERSION } from '../../gladly-operations'
import { Customer } from '../../gladly-shared-types'

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

  const event = createTestEvent({
    type: 'identify',
    event: 'Test Event',
    traits: {
      name: 'Joe Bob',
      email,
      phone,
      address: '123 Test St. New York City NY US 10001',
      tier: 'vip'
    }
  })

  describe('create customer', () => {
    describe('when the request is successful', () => {
      const override = false

      beforeEach(() => {
        nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(200, [])
        nock(baseUrl).post(`/customer-profiles`).reply(201, { id: '123' })
      })

      itCallsFindCustomerCorrectly(override)

      it('calls create customer correctly', async () => {
        const response = await whenInvoked(override)
        expect(response[1].url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.qa/api/v1/customer-profiles"`)
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
          `"{\\"name\\":\\"Joe Bob\\",\\"address\\":\\"123 Test St. New York City NY US 10001\\",\\"emails\\":[{\\"original\\":\\"joe.bob@gladly.com\\",\\"primary\\":false}],\\"phones\\":[{\\"original\\":\\"2345678901\\",\\"primary\\":false}],\\"customAttributes\\":{\\"tier\\":\\"vip\\"}}"`
        )
      })
    })

    describe('when the request fails', () => {
      const override = false
      beforeEach(() => {
        nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(400)
      })

      it('throws an http error', async () => {
        const response = await whenInvoked(override)
        expect(response).toBeInstanceOf(HTTPError)
      })
    })
  })

  describe('when update customer is successful', () => {
    const existingCustomer: Customer = {
      id: '123',
      name: 'Jane Doe',
      emails: [{ original: 'joedoe@gladly.com', primary: true }],
      phones: [{ original: '5678901234', primary: true }],
      address: '34 Gladly St. Houston TX 77002',
      customAttributes: { tier: 'regular' },
      createdAt: '2022-08-04'
    }

    describe('when override is true', () => {
      const override = true

      beforeEach(() => {
        nock(baseUrl).get(`/customer-profiles`).query({ email: email }).reply(200, [existingCustomer])
        nock(baseUrl).patch(`/customer-profiles/123`).reply(204, {})
      })

      itCallsFindCustomerCorrectly(override)

      it('calls update customer correctly', async () => {
        const response = await whenInvoked(override)

        expect(response[1].url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.qa/api/v1/customer-profiles/123"`)
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
          `"{\\"name\\":\\"Joe Bob\\",\\"address\\":\\"123 Test St. New York City NY US 10001\\",\\"emails\\":[{\\"original\\":\\"joedoe@gladly.com\\",\\"primary\\":true},{\\"original\\":\\"joe.bob@gladly.com\\",\\"primary\\":false}],\\"phones\\":[{\\"original\\":\\"5678901234\\",\\"primary\\":true},{\\"original\\":\\"2345678901\\",\\"primary\\":false}],\\"customAttributes\\":{\\"tier\\":\\"vip\\"}}"`
        )
      })
    })

    describe('when override is false', () => {
      const override = false

      beforeEach(() => {
        nock(baseUrl).get(`/customer-profiles`).query({ email: email }).reply(200, [existingCustomer])
        nock(baseUrl).patch(`/customer-profiles/123`).reply(204, {})
      })

      itCallsFindCustomerCorrectly(override)

      it('calls update customer correctly', async () => {
        const response = await whenInvoked(override)

        expect(response[1].url).toMatchInlineSnapshot(`"https://test-org.us-1.gladly.qa/api/v1/customer-profiles/123"`)
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
        expect(response[1].options.body).toMatchInlineSnapshot(`"{}"`)
      })
    })
  })

  describe('when find customer fails', () => {
    const override = false

    beforeEach(() => {
      nock(baseUrl).get(`/customer-profiles`).query({ email }).reply(400)
    })

    it('throws an http error', async () => {
      const response = await whenInvoked(override)
      expect(response).toBeInstanceOf(HTTPError)
    })
  })

  describe('when update customer fails', () => {
    const override = false
    beforeEach(() => {
      nock(baseUrl)
        .get(`/customer-profiles`)
        .query({ email })
        .reply(200, [
          {
            id: '123'
          }
        ])
      nock(baseUrl).patch(`/customer-profiles/123`).reply(400)
    })

    it('throws an http error', async () => {
      const response = await whenInvoked(override)
      expect(response).toBeInstanceOf(HTTPError)
    })
  })

  function itCallsFindCustomerCorrectly(override: boolean) {
    it('calls find customer with the correct url', async () => {
      const response = await whenInvoked(override)

      expect(response[0].url).toMatchInlineSnapshot(
        `"https://test-org.us-1.gladly.qa/api/v1/customer-profiles?email=joe.bob%40gladly.com"`
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
  }

  async function whenInvoked(override: boolean) {
    try {
      return await testDestination.testAction('customer', {
        event,
        settings,
        mapping: {
          name: { '@path': '$.traits.name' },
          email: { '@path': '$.traits.email' },
          phone: { '@path': '$.traits.phone' },
          address: { '@path': '$.traits.address' },
          customAttributes: { tier: { '@path': '$.traits.tier' } },
          override
        }
      })
    } catch (e) {
      return e
    }
  }
})
