import { InputField } from '@segment/actions-core/src/destination-kit/types'

export const email: InputField = {
  label: 'Email Address',
  description: 'Email address for the customer',
  type: 'string',
  default: { '@path': '$.email' }
}

export const phone: InputField = {
  label: 'Phone Number',
  description:
    'Mobile phone number for the customer. Please ensure the number is either entered as is or following the E.164 format',
  type: 'string',
  default: {
    '@if': {
      exists: { '@path': '$.traits.phone' },
      then: { '@path': '$.traits.phone' },
      else: { '@path': '$.properties.phone' }
    }
  }
}
