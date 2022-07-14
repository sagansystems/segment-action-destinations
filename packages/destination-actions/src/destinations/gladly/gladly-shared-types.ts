import { Payload as CustomerPayload } from './customer/generated-types'
import { Payload as ConversationItemPayload } from './conversationItem/generated-types'

export type Email = {
  normalized?: string
  original: string
  primary?: boolean
}

export type Phone = {
  normalized?: string
  original: string
  primary?: boolean
  regionCode?: string
  extension?: string
  smsPreference?: string
  type?: string
}

export type CustomAttributes = {
  [key: string]: any
}

export type Customer = {
  name?: string
  image?: string
  address?: string
  emails?: Email[]
  phones?: Phone[]
  externalCustomerId?: string
  customAttributes?: CustomAttributes
  id: string
  createdAt: string
  updatedAt?: string
}

export type GenericPayload = Partial<CustomerPayload & ConversationItemPayload>
