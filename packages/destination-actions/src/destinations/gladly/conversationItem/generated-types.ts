// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
  /**
   * Email address for the customer
   */
  email?: string
  /**
   * Mobile phone number for the customer. Please ensure the number is either entered as is or following the E.164 format
   */
  phone?: string
  /**
   * First line of highlighted text for the item in the customer timeline,
   */
  title: string
  /**
   * Plain text or rich content of the activity that will appear as the main content.
   */
  body: string
  /**
   * Type of this activity. This will determine the icon displayed in the customer timeline.
   */
  activityType: string
  /**
   * Name of the source system generating this activity
   */
  sourceName: string
}
