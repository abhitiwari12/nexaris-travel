import { Injectable } from '@nestjs/common';
import { Prisma } from '@nexaris/database';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { AirportQueryDto, AirlineQueryDto, FavoriteRouteDto, TrackRouteDto } from '../flights.dto.js';
import type { FlightOfferView } from '../flights.types.js';

@Injectable()
export class FlightsRepository {
  constructor(private readonly prisma: PrismaService) {}
  airports(query: AirportQueryDto) { return this.prisma.airport.findMany({ where: { AND: [{ country: query.country ? { contains: query.country, mode: 'insensitive' } : undefined }, { city: query.city ? { contains: query.city, mode: 'insensitive' } : undefined }, query.query ? { OR: [{ iataCode: { contains: query.query, mode: 'insensitive' } }, { name: { contains: query.query, mode: 'insensitive' } }, { city: { contains: query.query, mode: 'insensitive' } }] } : {}] }, orderBy: [{ popularity: 'desc' }, { iataCode: 'asc' }], take: 20 }); }
  airlines(query: AirlineQueryDto) { return this.prisma.airline.findMany({ where: { AND: [{ alliance: query.alliance ? { equals: query.alliance, mode: 'insensitive' } : undefined }, { country: query.country ? { contains: query.country, mode: 'insensitive' } : undefined }, query.query ? { OR: [{ iataCode: { contains: query.query, mode: 'insensitive' } }, { name: { contains: query.query, mode: 'insensitive' } }] } : {}] }, orderBy: { name: 'asc' }, take: 30 }); }
  saveAnalytics(origin: string, destination: string, resultCount: number, latencyMs: number, cacheHit: boolean) { return this.prisma.searchAnalytics.create({ data: { origin, destination, resultCount, latencyMs, cacheHit, provider: 'AMADEUS' } }); }
  saveSearch(searchHash: string, criteria: Prisma.InputJsonValue, offers: FlightOfferView[], latencyMs: number, userId?: string) { return this.prisma.flightSearch.upsert({ where: { searchHash }, update: { resultCount: offers.length, cheapestPrice: this.lowest(offers), fastestMinutes: this.fastest(offers), latencyMs }, create: { userId, searchHash, criteria, resultCount: offers.length, cheapestPrice: this.lowest(offers), fastestMinutes: this.fastest(offers), latencyMs, provider: 'AMADEUS' } }); }
  track(userId: string, dto: TrackRouteDto) { return this.prisma.trackedRoute.create({ data: { userId, origin: dto.origin.toUpperCase(), destination: dto.destination.toUpperCase(), departureDate: new Date(dto.departureDate), returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined, currency: dto.currency?.toUpperCase() ?? 'USD', targetPrice: dto.targetPrice, notifyOnDrop: dto.notifyOnDrop ?? true } }); }
  tracking(userId: string) { return this.prisma.trackedRoute.findMany({ where: { userId }, include: { priceHistories: { orderBy: { observedAt: 'desc' }, take: 20 } }, orderBy: { createdAt: 'desc' } }); }
  deleteTracking(userId: string, id: string) { return this.prisma.trackedRoute.deleteMany({ where: { id, userId } }); }
  favorite(userId: string, dto: FavoriteRouteDto) { return this.prisma.favoriteRoute.upsert({ where: { userId_origin_destination: { userId, origin: dto.origin.toUpperCase(), destination: dto.destination.toUpperCase() } }, update: { name: dto.name }, create: { userId, origin: dto.origin.toUpperCase(), destination: dto.destination.toUpperCase(), name: dto.name } }); }
  favorites(userId: string) { return this.prisma.favoriteRoute.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }); }
  private lowest(offers: FlightOfferView[]): number | undefined { return offers.length ? Math.min(...offers.map((offer) => offer.price)) : undefined; }
  private fastest(offers: FlightOfferView[]): number | undefined { return offers.length ? Math.min(...offers.map((offer) => offer.durationMinutes)) : undefined; }
}
