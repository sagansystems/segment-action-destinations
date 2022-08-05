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
  const customerEmails = payload.email ? [{ original: payload.email, primary: false }] : []
  const customerPhones = payload.phone ? [{ original: payload.phone, primary: false }] : []

  return {
    name: payload.name,
    address: payload.address,
    emails: customerEmails,
    phones: customerPhones,
    customAttributes: payload.customAttributes
  }
}

const generateUpdateCustomerJSON = (existingCustomer: Customer, payload: CustomerPayload) => {
  const overrideExistingValues = payload.override

  const customerEmails = existingCustomer.emails || []
  if (payload.email) {
    const normalizedEmail = normalizeEmail(payload.email)
    if (!find(customerEmails, { normalized: normalizedEmail }) && !find(customerEmails, { original: payload.email })) {
      customerEmails.push({ original: payload.email, primary: false })
    }
  }

  const customerPhones = existingCustomer.phones || []
  if (payload.phone && !find(existingCustomer.phones, { original: payload.phone })) {
    customerPhones.push({ original: payload.phone, primary: false })
  }

  const customAttributes = overrideExistingValues
    ? assign(existingCustomer.customAttributes, payload.customAttributes)
    : existingCustomer.customAttributes

  return {
    name: overrideExistingValues && payload.name ? payload.name : existingCustomer.name,
    address: overrideExistingValues && payload.address ? payload.address : existingCustomer.address,
    emails: customerEmails,
    phones: customerPhones,
    customAttributes
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
