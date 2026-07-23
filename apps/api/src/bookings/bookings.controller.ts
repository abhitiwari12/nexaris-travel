import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AncillarySelectionDto, BaggageSelectionDto, BookingPassengerDto, CancelBookingDto, CreateBookingDto, SeatAssignmentDto, UpdateBookingDto } from './bookings.dto.js';
import { BookingsService } from './bookings.service.js';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookingDto) { return this.bookings.create(user.id, dto); }
  @Get() list(@CurrentUser() user: AuthenticatedUser) { return this.bookings.list(user.id); }
  @Get(':id') get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.bookings.get(user.id, id); }
  @Patch(':id') update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateBookingDto) { return this.bookings.update(user.id, id, dto); }
  @Delete(':id') delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.bookings.delete(user.id, id); }
  @Post(':id/passengers') passengers(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: { passengers: BookingPassengerDto[] }) { return this.bookings.addPassengers(user.id, id, dto.passengers); }
  @Post(':id/seats') seats(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: SeatAssignmentDto) { return this.bookings.seats(user.id, id, dto); }
  @Post(':id/baggage') baggage(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: BaggageSelectionDto) { return this.bookings.baggage(user.id, id, dto); }
  @Post(':id/ancillary') ancillary(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: AncillarySelectionDto) { return this.bookings.ancillary(user.id, id, dto); }
  @Post(':id/confirm') confirm(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.bookings.confirm(user.id, id); }
  @Post(':id/cancel') cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CancelBookingDto) { return this.bookings.cancel(user.id, id, dto); }
  @Get(':id/ticket') ticket(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.bookings.ticket(user.id, id); }
  @Get(':id/invoice') invoice(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.bookings.invoice(user.id, id); }
  @Get(':id/boarding-pass') boardingPass(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.bookings.boardingPass(user.id, id); }
}
