import { z } from "zod";

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

/**
 * Schema for user registration/signup
 */
export const signupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  referralCode: z
    .string()
    .length(8, "Referral code must be 8 characters")
    .toUpperCase()
    .optional(),
});

// ============================================================================
// ORGANIZATION SCHEMAS
// ============================================================================

/**
 * Valid organization types
 */
export const organizationTypeEnum = z.enum([
  "startup",
  "nonprofit",
  "small_business",
  "research",
  "university",
  "government",
  "other",
]);

/**
 * Valid legal structures
 */
export const legalStructureEnum = z.enum([
  "llc",
  "LLC",
  "corporation",
  "c_corp",
  "s_corp",
  "501c3",
  "501c4",
  "501c6",
  "partnership",
  "sole_proprietorship",
  "cooperative",
  "benefit_corp",
  "other",
]);

/**
 * Valid team sizes
 */
export const teamSizeEnum = z.enum([
  "1",
  "2-5",
  "6-10",
  "11-25",
  "26-50",
  "51-100",
  "101-250",
  "251-500",
  "500+",
]);

/**
 * US state codes
 */
export const stateCodeEnum = z.enum([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC", "PR", "VI", "GU", "AS", "MP", "ALL",
]);

/**
 * Schema for creating/updating an organization profile
 */
export const organizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(200, "Organization name must be less than 200 characters")
    .trim(),
  type: organizationTypeEnum.optional(),
  legalStructure: legalStructureEnum.optional(),
  ein: z
    .string()
    .regex(/^\d{2}-\d{7}$/, "EIN must be in format XX-XXXXXXX")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid URL (e.g., https://example.com)")
    .max(500, "Website URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "City must be less than 100 characters")
    .trim()
    .optional(),
  state: stateCodeEnum.optional(),
  mission: z
    .string()
    .max(2000, "Mission statement must be less than 2000 characters")
    .trim()
    .optional(),
  vision: z
    .string()
    .max(2000, "Vision statement must be less than 2000 characters")
    .trim()
    .optional(),
  problemStatement: z
    .string()
    .max(3000, "Problem statement must be less than 3000 characters")
    .trim()
    .optional(),
  solution: z
    .string()
    .max(3000, "Solution description must be less than 3000 characters")
    .trim()
    .optional(),
  targetMarket: z
    .string()
    .max(2000, "Target market description must be less than 2000 characters")
    .trim()
    .optional(),
  teamSize: teamSizeEnum.optional(),
  founderBackground: z
    .string()
    .max(3000, "Founder background must be less than 3000 characters")
    .trim()
    .optional(),
  annualRevenue: z
    .string()
    .max(50, "Annual revenue must be less than 50 characters")
    .trim()
    .optional(),
  fundingSeeking: z
    .string()
    .max(50, "Funding seeking amount must be less than 50 characters")
    .trim()
    .optional(),
  previousFunding: z
    .string()
    .max(2000, "Previous funding history must be less than 2000 characters")
    .trim()
    .optional(),
});

// ============================================================================
// GRANT SCHEMAS
// ============================================================================

/**
 * Valid grant types
 */
export const grantTypeEnum = z.enum([
  "federal",
  "state",
  "foundation",
  "corporate",
  "university",
  "other",
]);

/**
 * Valid grant categories
 */
export const grantCategoryEnum = z.enum([
  "sbir",
  "sttr",
  "nsf",
  "nih",
  "doe",
  "dod",
  "usda",
  "epa",
  "research",
  "innovation",
  "technology",
  "healthcare",
  "education",
  "environment",
  "social_impact",
  "arts_culture",
  "community",
  "other",
]);

/**
 * Schema for grant search/filter parameters
 */
export const grantSearchSchema = z.object({
  query: z
    .string()
    .max(500, "Search query must be less than 500 characters")
    .trim()
    .optional(),
  type: grantTypeEnum.optional(),
  category: grantCategoryEnum.optional(),
  minAmount: z
    .number()
    .int("Minimum amount must be a whole number")
    .min(0, "Minimum amount cannot be negative")
    .max(1000000000, "Minimum amount is too large")
    .optional(),
  maxAmount: z
    .number()
    .int("Maximum amount must be a whole number")
    .min(0, "Maximum amount cannot be negative")
    .max(1000000000, "Maximum amount is too large")
    .optional(),
  state: stateCodeEnum.optional(),
  page: z
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1)
    .optional(),
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20)
    .optional(),
}).refine(
  (data) => {
    if (data.minAmount !== undefined && data.maxAmount !== undefined) {
      return data.minAmount <= data.maxAmount;
    }
    return true;
  },
  {
    message: "Minimum amount cannot be greater than maximum amount",
    path: ["minAmount"],
  }
);

/**
 * Schema for grant matching request
 */
export const grantMatchSchema = z.object({
  organizationId: z
    .string()
    .cuid("Invalid organization ID format")
    .optional(),
});

/**
 * Schema for bulk grant import
 */
export const bulkGrantSchema = z.object({
  grants: z.array(
    z.object({
      title: z
        .string()
        .min(1, "Grant title is required")
        .max(500, "Grant title must be less than 500 characters"),
      funder: z
        .string()
        .min(1, "Funder name is required")
        .max(300, "Funder name must be less than 300 characters"),
      description: z
        .string()
        .max(10000, "Description must be less than 10000 characters")
        .optional(),
      amount: z
        .string()
        .max(100, "Amount must be less than 100 characters")
        .optional(),
      amountMin: z
        .number()
        .int()
        .min(0)
        .nullable()
        .optional(),
      amountMax: z
        .number()
        .int()
        .min(0)
        .nullable()
        .optional(),
      deadline: z
        .string()
        .datetime("Invalid deadline format")
        .nullable()
        .optional(),
      url: z
        .string()
        .url("Invalid URL format")
        .max(2000)
        .optional(),
      type: grantTypeEnum.optional(),
      category: grantCategoryEnum.optional(),
      eligibility: z
        .string()
        .max(5000)
        .optional(),
      state: stateCodeEnum.optional(),
      tags: z.array(z.string().max(50)).optional(),
      source: z
        .string()
        .max(100)
        .optional(),
      agencyName: z
        .string()
        .max(300)
        .optional(),
      oppNumber: z
        .string()
        .max(100)
        .optional(),
    })
  ).min(1, "At least one grant is required"),
});

// ============================================================================
// APPLICATION SCHEMAS
// ============================================================================

/**
 * Valid application statuses
 */
export const applicationStatusEnum = z.enum([
  "draft",
  "in_progress",
  "ready_for_review",
  "submitted",
  "pending",
  "awarded",
  "rejected",
]);

/**
 * Schema for creating a new application
 */
export const applicationCreateSchema = z.object({
  grantId: z
    .string()
    .cuid("Invalid grant ID format"),
  responses: z
    .record(z.string(), z.unknown())
    .optional(),
  narrative: z
    .string()
    .max(50000, "Narrative must be less than 50000 characters")
    .optional(),
  budget: z
    .string()
    .max(10000, "Budget must be less than 10000 characters")
    .optional(),
  notes: z
    .string()
    .max(5000, "Notes must be less than 5000 characters")
    .optional(),
});

/**
 * Schema for updating an existing application
 */
export const applicationUpdateSchema = z.object({
  id: z
    .string()
    .cuid("Invalid application ID format"),
  status: applicationStatusEnum.optional(),
  responses: z
    .record(z.string(), z.unknown())
    .optional(),
  narrative: z
    .string()
    .max(50000, "Narrative must be less than 50000 characters")
    .optional(),
  budget: z
    .string()
    .max(10000, "Budget must be less than 10000 characters")
    .optional(),
  notes: z
    .string()
    .max(5000, "Notes must be less than 5000 characters")
    .optional(),
  submittedAt: z
    .string()
    .datetime("Invalid date format")
    .optional(),
  awardAmount: z
    .number()
    .int("Award amount must be a whole number")
    .min(0, "Award amount cannot be negative")
    .optional(),
});

/**
 * Schema for filtering applications
 */
export const applicationFilterSchema = z.object({
  status: z.union([
    applicationStatusEnum,
    z.literal("all"),
    z.literal("active"),
    z.literal("completed"),
  ]).optional(),
});

// ============================================================================
// DOCUMENT SCHEMAS
// ============================================================================

/**
 * Valid document types
 */
export const documentTypeEnum = z.enum([
  "pitch_deck",
  "financials",
  "business_plan",
  "tax_return",
  "incorporation_docs",
  "budget",
  "resume",
  "letter_of_support",
  "other",
]);

/**
 * Schema for document upload
 */
export const documentUploadSchema = z.object({
  name: z
    .string()
    .min(1, "Document name is required")
    .max(255, "Document name must be less than 255 characters")
    .trim(),
  type: documentTypeEnum.optional(),
  filePath: z
    .string()
    .max(1000, "File path must be less than 1000 characters")
    .optional(),
  fileSize: z
    .number()
    .int("File size must be a whole number")
    .min(0, "File size cannot be negative")
    .max(104857600, "File size cannot exceed 100MB")
    .optional(),
  mimeType: z
    .string()
    .max(100, "MIME type must be less than 100 characters")
    .optional(),
});

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

/**
 * Valid alert frequency options
 */
export const alertFrequencyEnum = z.enum([
  "instant",
  "daily",
  "weekly",
]);

/**
 * Valid alert category options
 */
export const alertCategoryEnum = z.enum([
  "AI",
  "healthcare",
  "climate",
  "technology",
  "education",
  "research",
  "small_business",
  "nonprofit",
  "social_impact",
  "environment",
  "arts_culture",
  "agriculture",
  "manufacturing",
  "energy",
  "transportation",
  "defense",
  "all",
]);

/**
 * Schema for updating alert/notification settings
 */
export const alertSettingsSchema = z.object({
  alertsEnabled: z
    .boolean()
    .optional(),
  alertFrequency: alertFrequencyEnum.optional(),
  alertCategories: z
    .array(alertCategoryEnum)
    .max(20, "Cannot select more than 20 categories")
    .optional(),
  deadlineReminders: z
    .boolean()
    .optional(),
  weeklyDigest: z
    .boolean()
    .optional(),
  trialReminders: z
    .boolean()
    .optional(),
});

/**
 * Schema for updating user profile/settings
 */
export const userSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim()
    .optional(),
});

/**
 * Schema for password change
 */
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

// ============================================================================
// INFERRED TYPESCRIPT TYPES
// ============================================================================

// Auth types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// Organization types
export type OrganizationType = z.infer<typeof organizationTypeEnum>;
export type LegalStructure = z.infer<typeof legalStructureEnum>;
export type TeamSize = z.infer<typeof teamSizeEnum>;
export type StateCode = z.infer<typeof stateCodeEnum>;
export type OrganizationInput = z.infer<typeof organizationSchema>;

// Grant types
export type GrantType = z.infer<typeof grantTypeEnum>;
export type GrantCategory = z.infer<typeof grantCategoryEnum>;
export type GrantSearchInput = z.infer<typeof grantSearchSchema>;
export type GrantMatchInput = z.infer<typeof grantMatchSchema>;
export type BulkGrantInput = z.infer<typeof bulkGrantSchema>;

// Application types
export type ApplicationStatus = z.infer<typeof applicationStatusEnum>;
export type ApplicationCreateInput = z.infer<typeof applicationCreateSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
export type ApplicationFilterInput = z.infer<typeof applicationFilterSchema>;

// Document types
export type DocumentType = z.infer<typeof documentTypeEnum>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

// Settings types
export type AlertFrequency = z.infer<typeof alertFrequencyEnum>;
export type AlertCategory = z.infer<typeof alertCategoryEnum>;
export type AlertSettingsInput = z.infer<typeof alertSettingsSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates data against a schema and returns a typed result
 */
export function validateSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Formats Zod errors into a simple object for API responses
 */
export function formatValidationErrors(
  error: z.ZodError
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}

/**
 * Formats Zod errors into a flat array of messages
 */
export function formatValidationErrorMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Parse and validate request body with automatic error formatting
 */
export async function parseRequestBody<T>(
  schema: z.ZodType<T>,
  body: unknown
): Promise<{ data: T | null; error: string | null; errors: Record<string, string> | null }> {
  const result = schema.safeParse(body);
  if (result.success) {
    return { data: result.data, error: null, errors: null };
  }
  return {
    data: null,
    error: "Validation failed",
    errors: formatValidationErrors(result.error),
  };
}
