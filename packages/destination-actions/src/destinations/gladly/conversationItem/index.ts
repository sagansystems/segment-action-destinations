import { ActionDefinition, IntegrationError } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { Gladly } from '../gladly-operations'
import { email, phone, externalCustomerId } from '../gladly-shared-properties'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Conversation Item',
  description: '',
  fields: {
    email,
    phone,
    externalCustomerId,
    title: {
      label: 'Title',
      description: 'First line of highlighted text for the item in the customer timeline,',
      type: 'string',
      required: true,
      default: {
        '@path': '$.event'
      }
    },
    body: {
      label: 'Body',
      description: 'Plain text or rich content of the activity that will appear as the main content.',
      type: 'string',
      required: true
    }
  },
  perform: async (request, { settings, payload }) => {
    const gladly = new Gladly(settings, request)

    const response = await gladly.findCustomer(payload)
    if (response) {
      const customerId = response.data[0].id
      return await gladly.createConversationItem(customerId, payload)
    } else {
      throw new IntegrationError('Unable to find customer')
    }
  }
}

export default action
