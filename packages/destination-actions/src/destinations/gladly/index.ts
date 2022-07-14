import type { DestinationDefinition } from '@segment/actions-core'
import type { Settings } from './generated-types'

import conversationItem from './conversationItem'

import customer from './customer'

const destination: DestinationDefinition<Settings> = {
  name: 'Gladly',
  slug: 'actions-gladly',
  mode: 'cloud',

  authentication: {
    scheme: 'basic',
    fields: {
      username: {
        label: 'Admin Email Address',
        description: 'Your Gladly admin email address',
        type: 'string',
        required: true
      },
      password: {
        label: 'Admin API Key',
        description: 'Your Gladly admin api key',
        type: 'string',
        required: true
      },
      url: {
        label: 'Gladly Url',
        description: 'Your Gladly Url',
        type: 'string',
        required: true
      }
    }
  },

  extendRequest({ settings }) {
    return {
      username: settings.username,
      password: settings.password
    }
  },

  actions: {
    conversationItem,
    customer
  }
}

export default destination
