import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { FlightsModule } from './flights/flights.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { AiModule } from './ai/ai.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { EmailModule } from './email/email.module.js';
import { CacheModule } from './cache/cache.module.js';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true }), ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]), PrismaModule, CacheModule, EmailModule, HealthModule, AuthModule, UsersModule, FlightsModule, BookingsModule, PaymentsModule, AiModule] })
export class AppModule {}
