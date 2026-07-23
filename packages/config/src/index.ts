import { z } from 'zod';
export const envSchema = z.object({ DATABASE_URL: z.string().url(), REDIS_URL: z.string().url(), JWT_SECRET: z.string().min(32), OPENAI_API_KEY: z.string().min(1), AMADEUS_CLIENT_ID: z.string().min(1), AMADEUS_CLIENT_SECRET: z.string().min(1), STRIPE_SECRET_KEY: z.string().min(1), RAZORPAY_KEY_ID: z.string().min(1), S3_ENDPOINT: z.string().url(), RESEND_API_KEY: z.string().optional() });
export type NexarisEnv = z.infer<typeof envSchema>;
