import { z } from "zod";

export const CustomerStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"]);

export const CustomerTypeSchema = z.enum([
  "INDIVIDUAL",
  "CORPORATE",
  "FAMILY",
  "GROUP",
  "GOVERNMENT",
  "SCHOOL",
  "MEDIA",
  "INFLUENCER",
  "TRAVEL_AGENT",
]);

export const ContactTypeSchema = z.enum(["EMAIL", "PHONE", "WHATSAPP", "MOBILE", "WORK", "HOME", "FAX"]);

export const ContactPurposeSchema = z.enum(["PRIMARY", "BILLING", "EMERGENCY", "BOOKING", "MARKETING"]);

export const AddressTypeSchema = z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "PICKUP"]);

export const ConsentChannelSchema = z.enum(["EMAIL", "SMS", "WHATSAPP", "PUSH", "POSTAL"]);

export const ConsentTypeSchema = z.enum([
  "MARKETING_EMAIL",
  "MARKETING_SMS",
  "MARKETING_WHATSAPP",
  "PROMOTIONS",
  "TERMS_ACCEPTED",
  "PRIVACY_ACCEPTED",
  "DATA_PROCESSING",
]);

export const RelationshipTypeSchema = z.enum(["PARENT", "CHILD", "SPOUSE", "GUARDIAN", "EMERGENCY_CONTACT", "EMPLOYER", "EMPLOYEE", "COLLEAGUE"]);

export const DocumentTypeSchema = z.enum(["PASSPORT", "NATIONAL_ID", "VISA", "INSURANCE", "CONSENT_FORM", "WAIVER", "MEDICAL_CLEARANCE", "BIRTH_CERTIFICATE"]);

export const DocumentStatusSchema = z.enum(["PENDING", "VERIFIED", "EXPIRED", "REJECTED"]);

export const InteractionTypeSchema = z.enum([
  "PHONE_CALL",
  "EMAIL",
  "WHATSAPP",
  "VISIT",
  "COMPLAINT",
  "FEEDBACK",
  "SUPPORT_TICKET",
  "REFUND_REQUEST",
  "INCIDENT",
  "SPECIAL_REQUEST",
]);

export const LoyaltyTierSchema = z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM", "VIP"]);

export const TimelineEventTypeSchema = z.enum([
  "CUSTOMER_CREATED",
  "CUSTOMER_UPDATED",
  "REQUESTED_QUOTE",
  "QUOTE_APPROVED",
  "RESERVATION_HOLD_CREATED",
  "BOOKING_CREATED",
  "PAYMENT_RECEIVED",
  "VOUCHER_ISSUED",
  "CHECKED_IN",
  "BOARDED",
  "VOYAGE_COMPLETED",
  "REWARD_ISSUED",
  "PROMOTION_SENT",
  "CUSTOMER_RETURNED",
  "REFERRAL_GENERATED",
  "SEGMENT_ASSIGNED",
  "TIER_UPGRADED",
  "TIER_DOWNGRADED",
  "NOTE_ADDED",
  "DOCUMENT_UPLOADED",
  "CONSENT_UPDATED",
  "COMPLAINT_LOGGED",
  "FEEDBACK_RECEIVED",
  "CUSTOMER_MERGED",
]);

export const CreateCustomerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  displayName: z.string().max(200).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  alternativePhone: z.string().optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  nationality: z.string().optional().nullable(),
  countryOfResidence: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  idType: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  referrerCustomerId: z.string().uuid().optional().nullable(),
  marketingOptIn: z.boolean().default(false),
  isCorporate: z.boolean().default(false),
  isTravelAgent: z.boolean().default(false),
  isVip: z.boolean().default(false),
  preferredLanguage: z.string().optional().nullable(),
  preferredCurrency: z.string().length(3).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: CustomerStatusSchema.default("ACTIVE"),
});

export const UpdateCustomerSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().max(200).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  alternativePhone: z.string().optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  nationality: z.string().optional().nullable(),
  countryOfResidence: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  idType: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  marketingOptIn: z.boolean().optional(),
  isCorporate: z.boolean().optional(),
  isTravelAgent: z.boolean().optional(),
  isVip: z.boolean().optional(),
  preferredLanguage: z.string().optional().nullable(),
  preferredCurrency: z.string().length(3).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  status: CustomerStatusSchema.optional(),
});

export const CreateCustomerContactSchema = z.object({
  customerId: z.string().uuid(),
  type: ContactTypeSchema,
  value: z.string().min(1).max(200),
  label: z.string().max(100).optional().nullable(),
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  purpose: ContactPurposeSchema.default("PRIMARY"),
});

export const CreateCustomerAddressSchema = z.object({
  customerId: z.string().uuid(),
  type: AddressTypeSchema,
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  isPrimary: z.boolean().default(false),
});

export const CreateCustomerPreferenceSchema = z.object({
  customerId: z.string().uuid(),
  category: z.string().min(1).max(100),
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(500),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateCustomerSegmentSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  description: z.string().max(500).optional().nullable(),
  color: z.string().optional().nullable(),
  isSystem: z.boolean().default(false),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateCustomerSegmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().optional().nullable(),
  isSystem: z.boolean().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export const CreateCustomerTagSchema = z.object({
  customerId: z.string().uuid(),
  tag: z.string().min(1).max(50),
  color: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateCustomerTimelineSchema = z.object({
  customerId: z.string().uuid(),
  eventType: TimelineEventTypeSchema,
  description: z.string().min(1).max(500),
  relatedEntityType: z.string().optional().nullable(),
  relatedEntityId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
  recordedBy: z.string().uuid().optional().nullable(),
});

export const CreateCustomerInteractionSchema = z.object({
  customerId: z.string().uuid(),
  type: InteractionTypeSchema,
  direction: z.enum(["INBOUND", "OUTBOUND"]).default("INBOUND"),
  subject: z.string().max(200).optional().nullable(),
  summary: z.string().max(1000).optional().nullable(),
  details: z.string().max(5000).optional().nullable(),
  outcome: z.string().max(500).optional().nullable(),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  relatedEntityType: z.string().optional().nullable(),
  relatedEntityId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdBy: z.string().uuid().optional().nullable(),
});

export const CreateCustomerConsentSchema = z.object({
  customerId: z.string().uuid(),
  channel: ConsentChannelSchema,
  consentType: ConsentTypeSchema,
  isGranted: z.boolean(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  consentVersion: z.string().optional().nullable(),
});

export const CreateCustomerRelationshipSchema = z.object({
  customerId: z.string().uuid(),
  relatedCustomerId: z.string().uuid(),
  type: RelationshipTypeSchema,
  isEmergency: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateCustomerDocumentSchema = z.object({
  customerId: z.string().uuid(),
  type: DocumentTypeSchema,
  documentNumber: z.string().optional().nullable(),
  issuingCountry: z.string().optional().nullable(),
  issuingAuthority: z.string().optional().nullable(),
  issueDate: z.coerce.date().optional().nullable(),
  expiryDate: z.coerce.date().optional().nullable(),
  status: DocumentStatusSchema.default("PENDING"),
  fileUrl: z.string().url().optional().nullable(),
  fileKey: z.string().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  fileSize: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const CreateLoyaltyTierSchema = z.object({
  name: z.string().min(1).max(50),
  code: z.string().min(1).max(20),
  level: z.number().int().min(0).default(0),
  minPoints: z.number().int().min(0).default(0),
  minSpend: z.number().nonnegative().optional().nullable(),
  minBookings: z.number().int().min(0).optional().nullable(),
  benefits: z.record(z.string(), z.any()).optional(),
  color: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const CreateLoyaltyAccountSchema = z.object({
  customerId: z.string().uuid(),
  tierId: z.string().uuid(),
  pointsBalance: z.number().int().min(0).default(0),
});

export const CustomerSearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const CustomerListSchema = z.object({
  status: CustomerStatusSchema.optional(),
  segmentId: z.string().uuid().optional().nullable(),
  isVip: z.boolean().optional(),
  isCorporate: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type CustomerStatusType = z.infer<typeof CustomerStatusSchema>;
export type CustomerTypeType = z.infer<typeof CustomerTypeSchema>;
export type ContactTypeType = z.infer<typeof ContactTypeSchema>;
export type ContactPurposeType = z.infer<typeof ContactPurposeSchema>;
export type AddressTypeType = z.infer<typeof AddressTypeSchema>;
export type ConsentChannelType = z.infer<typeof ConsentChannelSchema>;
export type ConsentTypeType = z.infer<typeof ConsentTypeSchema>;
export type RelationshipTypeType = z.infer<typeof RelationshipTypeSchema>;
export type DocumentTypeType = z.infer<typeof DocumentTypeSchema>;
export type DocumentStatusType = z.infer<typeof DocumentStatusSchema>;
export type InteractionTypeType = z.infer<typeof InteractionTypeSchema>;
export type LoyaltyTierType = z.infer<typeof LoyaltyTierSchema>;
export type TimelineEventTypeType = z.infer<typeof TimelineEventTypeSchema>;

export type CreateCustomerSchemaType = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerSchemaType = z.infer<typeof UpdateCustomerSchema>;
export type CreateCustomerContactSchemaType = z.infer<typeof CreateCustomerContactSchema>;
export type CreateCustomerAddressSchemaType = z.infer<typeof CreateCustomerAddressSchema>;
export type CreateCustomerPreferenceSchemaType = z.infer<typeof CreateCustomerPreferenceSchema>;
export type CreateCustomerSegmentSchemaType = z.infer<typeof CreateCustomerSegmentSchema>;
export type UpdateCustomerSegmentSchemaType = z.infer<typeof UpdateCustomerSegmentSchema>;
export type CreateCustomerTagSchemaType = z.infer<typeof CreateCustomerTagSchema>;
export type CreateCustomerTimelineSchemaType = z.infer<typeof CreateCustomerTimelineSchema>;
export type CreateCustomerInteractionSchemaType = z.infer<typeof CreateCustomerInteractionSchema>;
export type CreateCustomerConsentSchemaType = z.infer<typeof CreateCustomerConsentSchema>;
export type CreateCustomerRelationshipSchemaType = z.infer<typeof CreateCustomerRelationshipSchema>;
export type CreateCustomerDocumentSchemaType = z.infer<typeof CreateCustomerDocumentSchema>;
export type CreateLoyaltyTierSchemaType = z.infer<typeof CreateLoyaltyTierSchema>;
export type CreateLoyaltyAccountSchemaType = z.infer<typeof CreateLoyaltyAccountSchema>;
