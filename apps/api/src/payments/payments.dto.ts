import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
export enum PaymentProviderDto { STRIPE='STRIPE', RAZORPAY='RAZORPAY' }
export class CreatePaymentIntentDto { @IsString() bookingId!: string; @IsEnum(PaymentProviderDto) provider!: PaymentProviderDto; @IsNumber() @IsPositive() amount!: number; @IsString() currency!: string; }
