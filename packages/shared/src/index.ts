import { z } from 'zod';

export const userRoleSchema = z.enum(['TRAVELER', 'AGENT', 'ADMIN', 'SUPER_ADMIN']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const flightSearchSchema = z.object({
  tripType: z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY']),
  origin: z.string().trim().length(3).max(3).toUpperCase(),
  destination: z.string().trim().length(3).max(3).toUpperCase(),
  departureDate: z.string().date(),
  returnDate: z.string().date().optional(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9).default(0),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  currency: z.string().trim().length(3).max(3).toUpperCase().default('USD')
}).refine((value) => value.tripType !== 'ROUND_TRIP' || Boolean(value.returnDate), 'returnDate is required for round trips');
export type FlightSearchInput = z.infer<typeof flightSearchSchema>;

export const passengerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  dateOfBirth: z.string().date(),
  nationality: z.string().trim().min(2),
  passportNumber: z.string().trim().min(6).optional(),
  passengerType: z.enum(['ADULT', 'CHILD', 'INFANT'])
});
export type PassengerInput = z.infer<typeof passengerSchema>;

export const bookingSchema = z.object({
  offerId: z.string().min(1),
  passengers: z.array(passengerSchema).min(1).max(9),
  contactEmail: z.string().email(),
  contactPhone: z.string().trim().min(7)
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const aiPromptSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  travelerContext: z.object({
    budget: z.number().positive().optional(),
    interests: z.array(z.string()).max(12).default([]),
    originAirport: z.string().length(3).optional()
  }).default({ interests: [] })
});
export type AiPromptInput = z.infer<typeof aiPromptSchema>;

export type ApiErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'RATE_LIMITED' | 'INTERNAL_ERROR';
export type ApiEnvelope<T> = { data: T; requestId: string; meta?: Record<string, string | number | boolean> };
export type ApiError = { code: ApiErrorCode; message: string; requestId: string; details?: unknown };
