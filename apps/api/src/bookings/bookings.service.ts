import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@nexaris/database';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { AncillarySelectionDto, BaggageSelectionDto, BookingPassengerDto, CancelBookingDto, CreateBookingDto, SeatAssignmentDto, UpdateBookingDto } from './bookings.dto.js';
import { BookingArtifactsService } from './bookings.artifacts.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService, private readonly email: EmailService, private readonly artifacts: BookingArtifactsService) {}
  async create(userId: string, dto: CreateBookingDto) {
    const offer = await this.prisma.flightOffer.findUnique({ where: { id: dto.offerId } });
    if (!offer) throw new NotFoundException('Selected flight offer is no longer available');
    const booking = await this.prisma.booking.create({ data: { reference: this.pnr(), userId, offerId: dto.offerId, status: BookingStatus.DRAFT, contactEmail: dto.contactEmail, contactPhone: dto.contactPhone, bookingPassengers: { create: dto.passengers.map((passenger) => this.passengerData(passenger)) }, timeline: { create: { event: 'BOOKING_CREATED', message: 'Draft booking created from selected offer' } }, statusHistory: { create: { toStatus: BookingStatus.DRAFT, reason: 'Initial booking draft' } }, bookingAuditLogs: { create: { actorId: userId, action: 'CREATE_BOOKING' } } }, include: this.includeAll() });
    return booking;
  }
  list(userId: string) { return this.prisma.booking.findMany({ where: { userId }, include: { offer: true, pnr: true, bookingPassengers: true }, orderBy: { createdAt: 'desc' } }); }
  async get(userId: string, id: string) { const booking = await this.prisma.booking.findFirst({ where: { id, userId }, include: this.includeAll() }); if (!booking) throw new NotFoundException('Booking not found'); return booking; }
  async update(userId: string, id: string, dto: UpdateBookingDto) { await this.ensureOwner(userId, id); return this.prisma.booking.update({ where: { id }, data: dto, include: this.includeAll() }); }
  async delete(userId: string, id: string) { await this.ensureOwner(userId, id); return this.prisma.booking.update({ where: { id }, data: { status: BookingStatus.EXPIRED, timeline: { create: { event: 'BOOKING_EXPIRED', message: 'Draft booking expired or deleted by traveler' } } } }); }
  async addPassengers(userId: string, id: string, passengers: BookingPassengerDto[]) { await this.ensureOwner(userId, id); return this.prisma.booking.update({ where: { id }, data: { bookingPassengers: { create: passengers.map((passenger) => this.passengerData(passenger)) }, timeline: { create: { event: 'PASSENGERS_ADDED', message: `${passengers.length} passenger records added` } } }, include: this.includeAll() }); }
  async seats(userId: string, id: string, dto: SeatAssignmentDto) { await this.ensureOwner(userId, id); return this.prisma.seatAssignment.create({ data: { bookingId: id, passengerId: dto.passengerId, segmentRef: dto.segmentRef, seatNumber: dto.seatNumber, cabin: dto.cabin, price: dto.price ?? 0, currency: dto.currency ?? 'USD', characteristics: dto.characteristics ?? [], heldUntil: new Date(Date.now() + 15 * 60000) } }); }
  async baggage(userId: string, id: string, dto: BaggageSelectionDto) { await this.ensureOwner(userId, id); return this.prisma.baggageSelection.create({ data: { bookingId: id, passengerId: dto.passengerId, type: dto.type, quantity: dto.quantity, weightKg: dto.weightKg, price: dto.price ?? 0, currency: dto.currency ?? 'USD' } }); }
  async ancillary(userId: string, id: string, dto: AncillarySelectionDto) { await this.ensureOwner(userId, id); return this.prisma.ancillarySelection.create({ data: { bookingId: id, passengerId: dto.passengerId, code: dto.code, name: dto.name, price: dto.price ?? 0, currency: dto.currency ?? 'USD', metadata: dto.metadata } }); }
  async confirm(userId: string, id: string) {
    const booking = await this.get(userId, id);
    if (booking.status === BookingStatus.CANCELLED) throw new ForbiddenException('Cancelled bookings cannot be confirmed');
    const pnrCode = this.pnr();
    const updated = await this.prisma.booking.update({ where: { id }, data: { status: BookingStatus.TICKETED, pnr: { upsert: { update: {}, create: { code: pnrCode, provider: 'NEXARIS' } } }, tickets: { create: booking.bookingPassengers.map((passenger, index) => ({ passengerId: passenger.id, ticketNumber: this.ticketNumber(index), eticketPdfBase64: this.artifacts.pdfBase64('Electronic Ticket', [booking.reference, passenger.firstName, passenger.lastName]) })) }, boardingPasses: { create: booking.bookingPassengers.map((passenger, index) => ({ passengerId: passenger.id, segmentRef: booking.offerId, sequenceNumber: String(index + 1).padStart(3, '0'), qrPayload: `${booking.reference}:${passenger.id}`, pdfBase64: this.artifacts.pdfBase64('Boarding Pass', [booking.reference, passenger.firstName, passenger.lastName]) })) }, invoices: { create: { number: `INV-${booking.reference}`, total: booking.offer.totalFare, currency: booking.offer.currency, pdfUrl: `data:application/pdf;base64,${this.artifacts.pdfBase64('Invoice', [booking.reference, String(booking.offer.totalFare), booking.offer.currency])}` } }, timeline: { create: { event: 'TICKET_ISSUED', message: 'PNR, electronic tickets, invoice, and boarding passes generated' } }, statusHistory: { create: { fromStatus: booking.status, toStatus: BookingStatus.TICKETED, reason: 'Fare confirmed and booking ticketed' } } }, include: this.includeAll() });
    await this.email.send({ to: booking.contactEmail, subject: `Booking confirmed ${booking.reference}`, html: `<p>Your booking ${booking.reference} is ticketed.</p>` });
    return updated;
  }
  async cancel(userId: string, id: string, dto: CancelBookingDto) { const booking = await this.get(userId, id); return this.prisma.booking.update({ where: { id }, data: { status: BookingStatus.CANCELLED, timeline: { create: { event: 'BOOKING_CANCELLED', message: dto.reason } }, statusHistory: { create: { fromStatus: booking.status, toStatus: BookingStatus.CANCELLED, reason: dto.reason } } }, include: this.includeAll() }); }
  async ticket(userId: string, id: string) { const booking = await this.get(userId, id); return { bookingId: id, tickets: booking.tickets }; }
  async invoice(userId: string, id: string) { const booking = await this.get(userId, id); return { bookingId: id, invoices: booking.invoices }; }
  async boardingPass(userId: string, id: string) { const booking = await this.get(userId, id); return { bookingId: id, boardingPasses: booking.boardingPasses }; }
  private async ensureOwner(userId: string, id: string): Promise<void> { const booking = await this.prisma.booking.findFirst({ where: { id, userId } }); if (!booking) throw new NotFoundException('Booking not found'); }
  private passengerData(passenger: BookingPassengerDto) { return { ...passenger, dateOfBirth: new Date(passenger.dateOfBirth), passportExpiry: passenger.passportExpiry ? new Date(passenger.passportExpiry) : undefined, wheelchairAssistance: passenger.wheelchairAssistance ?? false }; }
  private pnr(): string { return `NXR${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }
  private ticketNumber(index: number): string { return `706${Date.now()}${String(index).padStart(2, '0')}`; }
  private includeAll() { return { offer: true, bookingPassengers: true, seatAssignments: true, baggageSelections: true, ancillarySelections: true, timeline: true, statusHistory: true, pnr: true, tickets: true, invoices: true, boardingPasses: true } as const; }
}
