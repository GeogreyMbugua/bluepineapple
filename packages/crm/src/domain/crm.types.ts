export type CustomerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
export type CustomerType = "INDIVIDUAL" | "CORPORATE" | "FAMILY" | "GROUP" | "GOVERNMENT" | "SCHOOL" | "MEDIA" | "INFLUENCER" | "TRAVEL_AGENT";
export type ContactType = "EMAIL" | "PHONE" | "WHATSAPP" | "MOBILE" | "WORK" | "HOME" | "FAX";
export type ContactPurpose = "PRIMARY" | "BILLING" | "EMERGENCY" | "BOOKING" | "MARKETING";
export type AddressType = "HOME" | "WORK" | "BILLING" | "SHIPPING" | "PICKUP";
export type ConsentChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH" | "POSTAL";
export type ConsentType = "MARKETING_EMAIL" | "MARKETING_SMS" | "MARKETING_WHATSAPP" | "PROMOTIONS" | "TERMS_ACCEPTED" | "PRIVACY_ACCEPTED" | "DATA_PROCESSING";
export type RelationshipType = "PARENT" | "CHILD" | "SPOUSE" | "GUARDIAN" | "EMERGENCY_CONTACT" | "EMPLOYER" | "EMPLOYEE" | "COLLEAGUE";
export type DocumentType = "PASSPORT" | "NATIONAL_ID" | "VISA" | "INSURANCE" | "CONSENT_FORM" | "WAIVER" | "MEDICAL_CLEARANCE" | "BIRTH_CERTIFICATE";
export type DocumentStatus = "PENDING" | "VERIFIED" | "EXPIRED" | "REJECTED";
export type InteractionType = "PHONE_CALL" | "EMAIL" | "WHATSAPP" | "VISIT" | "COMPLAINT" | "FEEDBACK" | "SUPPORT_TICKET" | "REFUND_REQUEST" | "INCIDENT" | "SPECIAL_REQUEST";
export type InteractionDirection = "INBOUND" | "OUTBOUND";
export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "VIP";
export type TimelineEventType = 
  | "CUSTOMER_CREATED" 
  | "CUSTOMER_UPDATED" 
  | "REQUESTED_QUOTE" 
  | "QUOTE_APPROVED" 
  | "RESERVATION_HOLD_CREATED" 
  | "BOOKING_CREATED" 
  | "PAYMENT_RECEIVED" 
  | "VOUCHER_ISSUED" 
  | "CHECKED_IN" 
  | "BOARDED" 
  | "VOYAGE_COMPLETED" 
  | "REWARD_ISSUED" 
  | "PROMOTION_SENT" 
  | "CUSTOMER_RETURNED" 
  | "REFERRAL_GENERATED" 
  | "SEGMENT_ASSIGNED" 
  | "TIER_UPGRADED" 
  | "TIER_DOWNGRADED" 
  | "NOTE_ADDED" 
  | "DOCUMENT_UPLOADED" 
  | "CONSENT_UPDATED" 
  | "COMPLAINT_LOGGED" 
  | "FEEDBACK_RECEIVED" 
  | "CUSTOMER_MERGED";

export interface CustomerData {
  id: string;
  customerNumber?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  dateOfBirth?: Date;
  nationality?: string;
  countryOfResidence?: string;
  idNumber?: string;
  idType?: string;
  gender?: string;
  title?: string;
  occupation?: string;
  company?: string;
  source?: string;
  referrerCustomerId?: string;
  marketingOptIn: boolean;
  isCorporate: boolean;
  isTravelAgent: boolean;
  isVip: boolean;
  lifetimeValue: number;
  totalSpend: number;
  totalBookings: number;
  totalTripsCompleted: number;
  totalTripsCancelled: number;
  totalRewardsEarned: number;
  referralCount: number;
  outstandingBalance: number;
  lastBookingAt?: Date;
  lastVisitAt?: Date;
  firstVisitAt?: Date;
  nextAppointmentAt?: Date;
  preferredLanguage?: string;
  preferredCurrency?: string;
  notes?: string;
  metadata?: any;
  status: CustomerStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerProfile extends CustomerData {
  contacts: any[];
  addresses: any[];
  preferences: any[];
  segments: any[];
  tags: any[];
  interactions: any[];
  consents: any[];
  documents: any[];
  loyaltyAccount?: any;
  relationships: any[];
}

export interface CustomerInsights {
  customerId: string;
  lifetimeValue: number;
  totalSpend: number;
  totalBookings: number;
  totalTripsCompleted: number;
  totalTripsCancelled: number;
  cancellationRate: number;
  averageSpendPerTrip: number;
  favoriteExperience?: string;
  favoriteSeason?: string;
  averageGroupSize: number;
  lastVisit?: Date;
  nextBooking?: Date;
  totalRewardsEarned: number;
  referralCount: number;
  isCorporate: boolean;
  isVip: boolean;
  loyaltyTier?: string;
  loyaltyPoints: number;
  outstandingBalance: number;
  segmentNames: string[];
}
