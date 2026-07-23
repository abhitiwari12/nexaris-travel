import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@nexaris/database';
import { createHash } from 'node:crypto';
import { CacheService } from '../cache/cache.service.js';
import { AmadeusService } from './amadeus/amadeus.service.js';
import { AirlineQueryDto, AirportQueryDto, FavoriteRouteDto, FlightSearchDto, FlightSortDto, MultiCitySearchDto, TrackRouteDto } from './flights.dto.js';
import { FlightsRepository } from './repositories/flights.repository.js';
import type { FlightOfferView, PriceCalendarDay } from './flights.types.js';

@Injectable()
export class FlightsService {
  constructor(private readonly amadeus: AmadeusService, private readonly cache: CacheService, private readonly repository: FlightsRepository) {}
  async search(dto: FlightSearchDto, userId?: string): Promise<FlightOfferView[]> {
    const started = Date.now();
    const key = this.cacheKey('search', dto);
    const cached = await this.cache.get<FlightOfferView[]>(key);
    if (cached) { await this.repository.saveAnalytics(dto.origin.toUpperCase(), dto.destination.toUpperCase(), cached.length, Date.now() - started, true); return this.sort(this.filter(cached, dto), dto.sort); }
    const offers = this.sort(this.filter(await this.amadeus.search(dto), dto), dto.sort);
    await this.cache.set(key, offers, Number(process.env.FLIGHT_SEARCH_CACHE_TTL_SECONDS ?? 180));
    await this.repository.saveSearch(key, JSON.parse(JSON.stringify(dto)) as Prisma.InputJsonObject, offers, Date.now() - started, userId);
    await this.repository.saveAnalytics(dto.origin.toUpperCase(), dto.destination.toUpperCase(), offers.length, Date.now() - started, false);
    return offers;
  }
  async multiCity(dto: MultiCitySearchDto): Promise<FlightOfferView[]> { return this.sort(await this.amadeus.search(dto), FlightSortDto.BEST_VALUE); }
  async nearby(dto: FlightSearchDto): Promise<FlightOfferView[]> { return this.search(dto); }
  async offer(id: string, dto: FlightSearchDto): Promise<FlightOfferView> { const offer = (await this.search(dto)).find((candidate) => candidate.id === id); if (!offer) throw new NotFoundException('Flight offer not found in current search'); return offer; }
  async priceCalendar(dto: FlightSearchDto): Promise<PriceCalendarDay[]> { const base = new Date(dto.departureDate); const days = await Promise.all(Array.from({ length: 7 }, async (_value, offset) => { const date = new Date(base); date.setDate(base.getDate() + offset - 3); const offers = await this.search({ ...dto, departureDate: date.toISOString().slice(0, 10), sort: FlightSortDto.LOWEST_PRICE }); return { date: date.toISOString().slice(0, 10), lowestPrice: offers[0]?.price ?? 0, currency: dto.currency ?? 'USD' }; })); return days.filter((day) => day.lowestPrice > 0); }
  airports(query: AirportQueryDto) { return this.repository.airports(query); }
  airlines(query: AirlineQueryDto) { return this.repository.airlines(query); }
  track(userId: string, dto: TrackRouteDto) { return this.repository.track(userId, dto); }
  tracking(userId: string) { return this.repository.tracking(userId); }
  deleteTracking(userId: string, id: string) { return this.repository.deleteTracking(userId, id); }
  favorite(userId: string, dto: FavoriteRouteDto) { return this.repository.favorite(userId, dto); }
  favorites(userId: string) { return this.repository.favorites(userId); }
  private filter(offers: FlightOfferView[], dto: FlightSearchDto): FlightOfferView[] { return offers.filter((offer) => (dto.maxStops === undefined || offer.stops <= dto.maxStops) && (!dto.refundableOnly || offer.refundable) && (!dto.baggageIncluded || !offer.baggage.checked.toLowerCase().includes('see')) && (dto.maxDurationMinutes === undefined || offer.durationMinutes <= dto.maxDurationMinutes) && (!dto.alliances?.length || true)); }
  private sort(offers: FlightOfferView[], sort = FlightSortDto.BEST_VALUE): FlightOfferView[] { return [...offers].sort((a, b) => { if (sort === FlightSortDto.LOWEST_PRICE) return a.price - b.price; if (sort === FlightSortDto.FASTEST) return a.durationMinutes - b.durationMinutes; if (sort === FlightSortDto.FEWEST_STOPS) return a.stops - b.stops; if (sort === FlightSortDto.EARLIEST_DEPARTURE) return a.segments[0].departureAt.localeCompare(b.segments[0].departureAt); if (sort === FlightSortDto.LATEST_DEPARTURE) return b.segments[0].departureAt.localeCompare(a.segments[0].departureAt); if (sort === FlightSortDto.SHORTEST_LAYOVER) return this.totalLayover(a) - this.totalLayover(b); return b.score - a.score; }); }
  private totalLayover(offer: FlightOfferView): number { return offer.layovers.reduce((sum, layover) => sum + layover.minutes, 0); }
  private cacheKey(scope: string, value: unknown): string { return `flights:${scope}:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`; }
}
