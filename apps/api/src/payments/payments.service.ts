import { Injectable } from '@nestjs/common';
import { CreatePaymentIntentDto } from './payments.dto.js';
@Injectable()
export class PaymentsService { async createIntent(dto: CreatePaymentIntentDto) { return { provider: dto.provider, bookingId: dto.bookingId, amount: dto.amount, currency: dto.currency.toUpperCase(), status: 'PENDING' as const, clientSecretRequired: dto.provider === 'STRIPE' }; } async verifyWebhook(provider: string, signature: string) { return { provider, verified: signature.length > 16 }; } }
