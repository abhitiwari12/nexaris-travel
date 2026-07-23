import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePaymentIntentDto } from './payments.dto.js';
import { PaymentsService } from './payments.service.js';
@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentsController { constructor(private readonly payments: PaymentsService) {} @Post('intent') create(@Body() dto: CreatePaymentIntentDto) { return this.payments.createIntent(dto); } @Post('webhook') webhook(@Headers('x-provider') provider: string, @Headers('x-signature') signature: string) { return this.payments.verifyWebhook(provider, signature); } }
