import { RequestClient } from '@segment/actions-core'
import { mappings } from './gladly-mappings'
import type { Settings } from './generated-types'
import type { Customer } from './gladly-shared-types'
import type { Payload as ConversationItemPayload } from './conversationItem/generated-types'
import type { Payload as CustomerPayload } from './customer/generated-types'

export const API_VERSION = '/api/v1/'

const resources = {
  createItem: 'customers/{id}/conversation-items',
  createCustomer: 'customer-profiles',
  findCustomer: 'customer-profiles?{param}',
  updateCustomer: 'customer-profiles/{id}'
}

export class Gladly {
  url: string
  request: RequestClient

  constructor(settings: Settings, request: RequestClient) {
    this.url = settings.url
    this.request = request
  }

  createConversationItem = async (customerId: string, payload: ConversationItemPayload) => {
    const resource = resources['createItem'].replace('{id}', customerId)
    const url = this.generateUrl(resource)
    const json = mappings.conversationItem(payload)

    return await this.request(url, { method: 'post', json })
  }

  createCustomer = async (payload: CustomerPayload) => {
    const resource = resources['createCustomer']
    const url = this.generateUrl(resource)
    const json = mappings.createCustomer(payload)

    return await this.request(url, { method: 'post', json })
  }

  findCustomerByEmail = async (email: string) => {
    const param = `email=${encodeURIComponent(email)}`
    const resource = resources['findCustomer'].replace('{param}', param)
    const url = this.generateUrl(resource)

    return await this.request<Customer[]>(url, { method: 'get' })
  }

  findCustomerByPhone = async (phone: string) => {
    const param = `phoneNumber=${encodeURIComponent(phone)}`
    const resource = resources['findCustomer'].replace('{param}', param)
    const url = this.generateUrl(resource)

    return await this.request<Customer[]>(url, { method: 'get' })
  }

  updateCustomer = async (customer: Customer, payload: CustomerPayload) => {
    const resource = resources['updateCustomer'].replace('{id}', customer.id)
    const url = this.generateUrl(resource)
    const json = mappings.updateCustomer(customer, payload)

    return await this.request(url, { method: 'patch', json })
  }

  private generateUrl = (resource: string) => {
    return `${this.url}${API_VERSION}${resource}`
  }
}
