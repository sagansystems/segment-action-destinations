import assign from 'lodash/assign'
import find from 'lodash/find'
import type { Customer } from './gladly-shared-types'
import type { Payload as CreateConversationItemPayload } from './conversationItem/generated-types'
import type { Payload as CustomerPayload } from './customer/generated-types'

const generateConversationItemJSON = (payload: CreateConversationItemPayload) => {
  const customer = payload.email
    ? {
        emailAddress: payload.email
      }
    : {
        mobilePhone: payload.phone
      }

  return {
    customer,
    content: {
      type: 'CUSTOMER_ACTIVITY',
      title: payload.title,
      body: payload.body,
      activityType: payload.activityType,
      sourceName: payload.sourceName
    }
  }
}

const generateCreateCustomerJSON = (payload: CustomerPayload) => {
  return {
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.address ? { address: payload.address } : {}),
    ...(payload.email ? { emails: [{ original: payload.email, primary: false }] } : {}),
    ...(payload.phone ? { phones: [{ original: payload.phone, primary: false }] } : {}),
    ...(payload.customAttributes ? { customAttributes: payload.customAttributes } : {})
  }
}

const generateUpdateCustomerJSON = (existingCustomer: Customer, payload: CustomerPayload) => {
  const customerEmails = existingCustomer.emails || []

  if (payload.email) {
    const normalizedEmail = normalizeEmail(payload.email)
    if (!find(customerEmails, { normalized: normalizedEmail }) && !find(customerEmails, { original: payload.email })) {
      customerEmails.push({ original: payload.email, primary: false })
    }
  }

  const customerPhones = existingCustomer.phones || []

  if (
    payload.phone &&
    !find(existingCustomer.phones, { original: payload.phone }) &&
    !find(existingCustomer.phones, { normalized: payload.phone })
  ) {
    customerPhones.push({ original: payload.phone, primary: false })
  }

  const customAttributes = assign(existingCustomer.customAttributes, payload.customAttributes)

  return {
    ...(payload.override && payload.name ? { name: payload.name } : {}),
    ...(payload.override && payload.address ? { address: payload.address } : {}),
    ...(payload.override && payload.email ? { emails: customerEmails } : {}),
    ...(payload.override && payload.phone ? { phones: customerPhones } : {}),
    ...(payload.override && payload.customAttributes ? { customAttributes } : {})
  }
}

function normalizeEmail(email: string) {
  return email.trim().trimRight().toLowerCase() || email
}

export const mappings = {
  conversationItem: generateConversationItemJSON,
  createCustomer: generateCreateCustomerJSON,
  updateCustomer: generateUpdateCustomerJSON
}
