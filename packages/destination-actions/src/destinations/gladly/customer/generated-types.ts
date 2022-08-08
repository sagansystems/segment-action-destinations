// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
  /**
   * If true, this will override the existing Gladly Customer Profile data only if data is passed from the source
   */
  override: boolean
  /**
   * Customer's name
   */
  name?: string
  /**
   * Email address for the customer
   */
  email?: string
  /**
   * Mobile phone number for the customer. Please ensure the number is either entered as is or following the E.164 format
   */
  phone?: string
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
