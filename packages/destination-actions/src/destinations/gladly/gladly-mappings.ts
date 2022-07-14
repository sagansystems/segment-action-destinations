import isEmpty from 'lodash/isEmpty'
import find from 'lodash/find'
import type { GenericPayload, Customer, CustomAttributes, Email, Phone } from './gladly-shared-types'

const generateConversationItemJSON = (payload: GenericPayload) => {
  const customer = payload.email
    ? {
        emailAddress: payload.email
      }
    : {
        mobilePhone: payload.phone
      }
  const activityType = payload.email ? 'EMAIL' : 'SMS'

  return {
    customer,
    content: {
      type: 'CUSTOMER_ACTIVITY',
      title: payload.title,
      body: payload.body,
      activityType,
      sourceName: 'Segment'
    }
  }
}

const generateCreateCustomerJSON = (payload: GenericPayload) => {
  const name = payload.name ? payload.name : ''
  const emails = payload.email ? [{ original: payload.email, primary: true }] : []
  const phones = payload.phone ? [{ original: payload.phone, primary: true }] : []
  const address = payload.address ? payload.address : ''
  const externalCustomerId = payload.externalCustomerId ? payload.externalCustomerId : ''
  const customAttributes = payload.customAttributes ? payload.customAttributes : {}

  return {
    name,
    address,
    emails,
    phones,
    externalCustomerId,
    customAttributes
  }
}

const generateUpdateCustomerJSON = (customer: Customer, payload: GenericPayload) => {
  let name, address, externalCustomerId
  let emails: Email[] = []
  let phones: Phone[] = []
  const customAttributes: CustomAttributes = {}

  if (payload.name) {
    name = payload.name
  }

  if (customer.emails) {
    emails = customer.emails
  }
  if (payload.email && customer.emails && !find(customer.emails, { original: payload.email })) {
    customer.emails.push({ original: payload.email })
    emails = customer.emails
  }
  if (payload.email && isEmpty(customer.emails)) {
    emails = [{ original: payload.email, primary: true }]
  }

  if (customer.phones) {
    phones = customer.phones
  }
  if (payload.phone && customer.phones && !find(customer.phones, { original: payload.phone })) {
    customer.phones.push({ original: payload.phone })
    phones = customer.phones
  }
  if (payload.phone && isEmpty(customer.phones)) {
    phones = [{ original: payload.phone, primary: true }]
  }

  if (payload.address) {
    address = payload.address
  }

  if (payload.externalCustomerId) {
    externalCustomerId = payload.externalCustomerId
  }

  if (!isEmpty(payload.customAttributes) && !isEmpty(customer.customAttributes)) {
    for (const key in customer.customAttributes) {
      customAttributes[key] = customer.customAttributes[key]
    }
    for (const key in payload.customAttributes) {
      customAttributes[key] = payload.customAttributes[key]
    }
  }
  if (!isEmpty(payload.customAttributes) && isEmpty(customer.customAttributes)) {
    for (const key in payload.customAttributes) {
      customAttributes[key] = payload.customAttributes[key]
    }
  }

  return {
    name: name && name,
    address: address && address,
    emails: emails && emails,
    phones: phones && phones,
    externalCustomerId: externalCustomerId && externalCustomerId,
    customAttributes: customAttributes && customAttributes
  }
}

export const mappings = {
  conversationItem: generateConversationItemJSON,
  createCustomer: generateCreateCustomerJSON,
  updateCustomer: generateUpdateCustomerJSON
}
