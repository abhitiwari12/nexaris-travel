import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module.js';
import { BookingArtifactsService } from './bookings.artifacts.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
@Module({ imports: [EmailModule], controllers: [BookingsController], providers: [BookingsService, BookingArtifactsService] })
export class BookingsModule {}
