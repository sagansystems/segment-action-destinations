import nock from 'nock'
import { createTestIntegration } from '@segment/actions-core'
import Definition from '../index'

const testDestination = createTestIntegration(Definition)

describe('Gladly', () => {
  describe('testAuthentication', () => {
    it('should validate authentication inputs', async () => {
      nock('https://your.destination.endpoint').get('*').reply(200, {})

      const settings = {
        username: '<test username>',
        password: '<test password>',
        orgName: 'test-org',
        isSandbox: true
      }

      await expect(testDestination.testAuthentication(settings)).resolves.not.toThrowError()
    })
  })
})
