// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
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
   * First line of highlighted text for the item in the customer timeline,
   */
  title: string
  /**
   * Plain text or rich content of the activity that will appear as the main content.
   */
  body: string
}
