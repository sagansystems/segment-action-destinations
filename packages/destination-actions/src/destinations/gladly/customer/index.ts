import { IntegrationError, ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { Gladly } from '../gladly-operations'
import { email, phone } from '../gladly-shared-properties'

const action: ActionDefinition<Settings, Payload> = {
  title: 'Customer',
  description: '',
  fields: {
    name: {
      label: 'Name',
      description: "Customer's name",
      type: 'string',
      default: { '@path': '$.traits.name' }
    },
    email,
    phone,
    address: {
      label: 'Address',
      description: "Customer's full address",
      type: 'string',
      default: { '@path': '$.traits.address' }
    },
    customAttributes: {
      label: 'Custom Attributes',
      description:
        'Organization-specific attributes from Customer system of record. The shape of customAttributes is defined by the Customer Profile Definition.',
      type: 'object'
    },
    override: {
      label: 'Override Existing Values?',
      description: '',
      type: 'boolean',
      required: true
    }
  },
  perform: async (request, { settings, payload }) => {
    const gladly = new Gladly(settings, request)

    let findCustomerResponse

    if (payload.email) {
      findCustomerResponse = await gladly.findCustomerByEmail(payload.email)
    } else if (payload.phone) {
      findCustomerResponse = await gladly.findCustomerByPhone(payload.phone)
    } else {
      throw new IntegrationError('Unable to ')
    }

    if (findCustomerResponse.data.length) {
      const customer = findCustomerResponse.data[0]
      return await gladly.updateCustomer(customer, payload)
    } else {
      return await gladly.createCustomer(payload)
    }
  }
}

export default action
