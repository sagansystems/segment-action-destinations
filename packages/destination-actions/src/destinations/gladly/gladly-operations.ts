import { IntegrationError, RequestClient } from '@segment/actions-core'
import { mappings } from './gladly-mappings'
import type { Settings } from './generated-types'
import type { GenericPayload, Customer } from './gladly-shared-types'

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
    this.url = settings.orgName
    this.request = request
  }

  createConversationItem = async (customerId: string, payload: GenericPayload) => {
    this.validatePayload(payload)

    const resource = resources['createItem'].replace('{id}', customerId)
    const url = this.generateUrl(resource)
    const json = mappings.conversationItem(payload)

    const response = await this.request(url, { method: 'post', json })

    if (!response || response.status !== 200) {
      throw new IntegrationError('Unable to create customer conversation item')
    }
    return response
  }

  createCustomer = async (payload: GenericPayload) => {
    this.validatePayload(payload)

    const resource = resources['createCustomer']
    const url = this.generateUrl(resource)
    const json = mappings.createCustomer(payload)

    const response = await this.request(url, { method: 'post', json })

    if (!response || response.status !== 201) {
      throw new IntegrationError('Unable to create customer profile')
    }
    return response
  }

  findCustomer = async (payload: GenericPayload) => {
    this.validatePayload(payload)

    const params = this.generateParams(payload)

    for (const param of params) {
      const resource = resources['findCustomer'].replace('{param}', param)
      const url = this.generateUrl(resource)

      const response = await this.request<Customer[]>(url, { method: 'get' })

      if (response && response.data.length) {
        return response
      }
    }
  }

  updateCustomer = async (customer: Customer, payload: GenericPayload) => {
    this.validatePayload(payload)

    const resource = resources['updateCustomer'].replace('{id}', customer.id)
    const url = this.generateUrl(resource)
    const json = mappings.updateCustomer(customer, payload)

    const response = await this.request(url, { method: 'patch', json })

    if (!response || response.status !== 204) {
      throw new IntegrationError('Unable to update customer profile')
    }
    return response
  }

  private generateParams = (payload: GenericPayload) => {
    const params = []

    if (payload.email) params.push(`email=${encodeURIComponent(payload.email)}`)
    if (payload.phone) params.push(`phoneNumber=${encodeURIComponent(payload.phone)}`)
    if (payload.externalCustomerId) params.push(`externalCustomerId=${encodeURIComponent(payload.externalCustomerId)}`)

    return params
  }

  private generateUrl = (resource: string) => {
    return `${this.url}${API_VERSION}${resource}`
  }

  private validatePayload = (payload: GenericPayload) => {
    if (!payload.email && !payload.phone && !payload.externalCustomerId) {
      throw new IntegrationError('No identifying email, phone or external customer id')
    }
  }
}
