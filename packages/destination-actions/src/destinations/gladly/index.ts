import type { DestinationDefinition } from '@segment/actions-core'
import type { Settings } from './generated-types'
import { defaultValues } from '@segment/actions-core'
import conversationItem from './conversationItem'
import customer from './customer'

const presets: DestinationDefinition['presets'] = [
  {
    name: 'Track Calls',
    subscribe: 'type = "track"',
    partnerAction: 'trackEvent',
    mapping: defaultValues(conversationItem.fields)
  },
  {
    name: 'Identify Calls',
    subscribe: 'type = "identify"',
    partnerAction: 'identifyUser',
    mapping: defaultValues(customer.fields)
  }
]

const destination: DestinationDefinition<Settings> = {
  name: 'Gladly',
  slug: 'actions-gladly',
  mode: 'cloud',

  authentication: {
    scheme: 'basic',
    fields: {
      username: {
        label: "API User's Email Address",
        description: 'Your Gladly Admin Email Address',
        type: 'string',
        required: true
      },
      password: {
        label: "API User's API Key",
        description: 'Your Gladly Admin API Key',
        type: 'string',
        required: true
      },
      url: {
        label: 'Gladly URL',
        description: 'Your Gladly URL',
        type: 'string',
        format: 'uri',
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

  presets,
  actions: {
    conversationItem,
    customer
  }
}

export default destination
