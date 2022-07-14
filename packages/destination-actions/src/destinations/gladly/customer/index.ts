import { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { Gladly } from '../gladly-operations'
import { email, phone, externalCustomerId } from '../gladly-shared-properties'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Customer',
  description: '',
  fields: {
    name: {
      label: 'Name',
      description: "Customer's name",
      type: 'string',
      default: {
        '@if': {
          exists: { '@path': '$.traits.name' },
          then: { '@path': '$.traits.name' },
          else: { '@path': '$.properties.name' }
        }
      }
    },
    email,
    phone,
    externalCustomerId,
    address: {
      label: 'Address',
      description: "Customer's full address",
      type: 'string',
      default: {
        '@if': {
          exists: { '@path': '$.traits.address' },
          then: { '@path': '$.traits.address' },
          else: { '@path': '$.properties.address' }
        }
      }
    },
    customAttributes: {
      label: 'Custom Attributes',
      description:
        'Organization-specific attributes from Customer system of record. The shape of customAttributes is defined by the Customer Profile Definition.',
      type: 'object'
    }
  },
  perform: async (request, { settings, payload }) => {
    const gladly = new Gladly(settings, request)

    const response = await gladly.findCustomer(payload)
    if (response) {
      const customer = response.data[0]
      return await gladly.updateCustomer(customer, payload)
    } else {
      return await gladly.createCustomer(payload)
    }
  }
}

export default action
