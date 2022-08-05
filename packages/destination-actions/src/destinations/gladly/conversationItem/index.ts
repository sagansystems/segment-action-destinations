import { ActionDefinition, IntegrationError } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { Gladly } from '../gladly-operations'
import { email, phone } from '../gladly-shared-properties'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Conversation Item',
  description: '',
  fields: {
    email,
    phone,
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
    },
    activityType: {
      label: 'Activity Type',
      description: 'Type of this activity. This will determine the icon displayed in the customer timeline.',
      type: 'string',
      choices: [
        { label: 'Email', value: 'EMAIL' },
        { label: 'SMS', value: 'SMS' },
        { label: 'Issue', value: 'ISSUE' },
        { label: 'Survey', value: 'SURVEY' }
      ],
      required: true
    },
    sourceName: {
      label: 'Source Name',
      description: 'Name of the source system generating this activity',
      type: 'string',
      required: true
    }
  },
  perform: async (request, { settings, payload }) => {
    const gladly = new Gladly(settings, request)

    let customer

    if (payload.email) {
      customer = await gladly.findCustomerByEmail(payload.email)
    } else if (payload.phone) {
      customer = await gladly.findCustomerByPhone(payload.phone)
    } else {
      throw new IntegrationError('Unable to ')
    }

    if (customer.data.length) {
      const customerId = customer.data[0].id
      return await gladly.createConversationItem(customerId, payload)
    } else {
      throw new IntegrationError('Unable to find customer')
    }
  }
}

export default action
