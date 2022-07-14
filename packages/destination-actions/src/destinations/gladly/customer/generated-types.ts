// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
  /**
   * Customer's name
   */
  name?: string
  /**
   * Email address for the customer
   */
  email?: string
  /**
   * Mobile phone number for the customer
   */
  phone?: string
  /**
   * Customer ID in your system of record.
   */
  externalCustomerId: string
  /**
   * Customer's full address
   */
  address?: string
  /**
   * Organization-specific attributes from Customer system of record. The shape of customAttributes is defined by the Customer Profile Definition.
   */
  customAttributes?: {
    [k: string]: unknown
  }
}
