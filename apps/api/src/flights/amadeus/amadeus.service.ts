import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CacheService } from '../../cache/cache.service.js';
import type { FlightOfferView } from '../flights.types.js';
import type { FlightSearchDto, MultiCitySearchDto } from '../flights.dto.js';

type AmadeusToken = { access_token: string; expires_in: number };
type AmadeusFlightOffer = { id: string; price: { total: string; base?: string; currency: string; fees?: Array<{ amount: string }> }; itineraries: Array<{ duration: string; segments: Array<{ carrierCode: string; number: string; aircraft?: { code?: string }; departure: { iataCode: string; at: string; terminal?: string }; arrival: { iataCode: string; at: string; terminal?: string }; duration: string }> }>; travelerPricings?: Array<{ fareDetailsBySegment?: Array<{ cabin?: string; class?: string; includedCheckedBags?: { quantity?: number; weight?: number; weightUnit?: string } }> }>; numberOfBookableSeats?: number; pricingOptions?: { refundableFare?: boolean }; validatingAirlineCodes?: string[] };
type AmadeusResponse = { data: AmadeusFlightOffer[]; dictionaries?: { carriers?: Record<string, string>; aircraft?: Record<string, string> } };

@Injectable()
export class AmadeusService {
  private readonly baseUrl = process.env.AMADEUS_BASE_URL ?? 'https://test.api.amadeus.com';
  constructor(private readonly cache: CacheService) {}
  async search(dto: FlightSearchDto | MultiCitySearchDto): Promise<FlightOfferView[]> {
    const token = await this.getToken();
    const url = this.buildSearchUrl(dto);
    const response = await this.request<AmadeusResponse>(url, token);
    return response.data.map((offer) => this.mapOffer(offer, response.dictionaries?.carriers ?? {}, response.dictionaries?.aircraft ?? {}));
  }
  private async getToken(): Promise<string> {
    const cached = await this.cache.get<string>('amadeus:token');
    if (cached) return cached;
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) throw new ServiceUnavailableException('Amadeus credentials are not configured');
    const response = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.AMADEUS_CLIENT_ID, client_secret: process.env.AMADEUS_CLIENT_SECRET }) });
    if (!response.ok) throw new ServiceUnavailableException(`Amadeus token request failed with ${response.status}`);
    const token = await response.json() as AmadeusToken;
    await this.cache.set('amadeus:token', token.access_token, Math.max(token.expires_in - 60, 60));
    return token.access_token;
  }
  private async request<T>(url: string, token: string): Promise<T> {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) return response.json() as Promise<T>;
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new ServiceUnavailableException(`Amadeus request failed with ${response.status}`);
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
    throw new ServiceUnavailableException('Amadeus request failed');
  }
  private buildSearchUrl(dto: FlightSearchDto | MultiCitySearchDto): string {
    const params = new URLSearchParams();
    if ('legs' in dto) { const first = dto.legs[0]; const last = dto.legs[dto.legs.length - 1]; params.set('originLocationCode', first.origin.toUpperCase()); params.set('destinationLocationCode', last.destination.toUpperCase()); params.set('departureDate', first.departureDate); }
    else { params.set('originLocationCode', dto.origin.toUpperCase()); params.set('destinationLocationCode', dto.destination.toUpperCase()); params.set('departureDate', dto.departureDate); if (dto.returnDate) params.set('returnDate', dto.returnDate); if (dto.nonstop) params.set('nonStop', 'true'); if (dto.maxPrice) params.set('maxPrice', String(dto.maxPrice)); if (dto.airlines?.length) params.set('includedAirlineCodes', dto.airlines.map((airline) => airline.toUpperCase()).join(',')); }
    params.set('adults', String(dto.adults)); if (dto.children) params.set('children', String(dto.children)); if (dto.cabin) params.set('travelClass', dto.cabin); params.set('currencyCode', dto.currency?.toUpperCase() ?? 'USD'); params.set('max', '50');
    return `${this.baseUrl}/v2/shopping/flight-offers?${params.toString()}`;
  }
  private mapOffer(offer: AmadeusFlightOffer, carriers: Record<string, string>, aircraft: Record<string, string>): FlightOfferView {
    const segments = offer.itineraries.flatMap((itinerary) => itinerary.segments);
    const totalDuration = offer.itineraries.reduce((sum, itinerary) => sum + this.parseDuration(itinerary.duration), 0);
    const firstSegment = segments[0];
    const airlineCode = offer.validatingAirlineCodes?.[0] ?? firstSegment?.carrierCode ?? 'XX';
    const fare = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
    return { id: offer.id, provider: 'AMADEUS', price: Number(offer.price.total), taxes: Number(offer.price.total) - Number(offer.price.base ?? offer.price.total), currency: offer.price.currency, cabin: fare?.cabin ?? 'ECONOMY', bookingClass: fare?.class, fareFamily: fare?.class, refundable: Boolean(offer.pricingOptions?.refundableFare), stops: Math.max(segments.length - offer.itineraries.length, 0), durationMinutes: totalDuration, layovers: this.layovers(segments), segments: segments.map((segment) => ({ airlineCode: segment.carrierCode, flightNumber: segment.number, origin: segment.departure.iataCode, destination: segment.arrival.iataCode, departureAt: segment.departure.at, arrivalAt: segment.arrival.at, durationMinutes: this.parseDuration(segment.duration), aircraft: segment.aircraft?.code ? aircraft[segment.aircraft.code] ?? segment.aircraft.code : undefined, departureTerminal: segment.departure.terminal, arrivalTerminal: segment.arrival.terminal })), airlineCode, airlineName: carriers[airlineCode], baggage: { carryOn: 'Provider fare rules apply', checked: this.checkedBags(fare?.includedCheckedBags) }, seatsRemaining: offer.numberOfBookableSeats, mealAvailable: false, carbonEmissionsKg: undefined, fareRules: ['Confirm penalties and fare conditions before ticketing'], score: this.score(Number(offer.price.total), totalDuration, segments.length) };
  }
  private parseDuration(duration: string): number { const hours = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(duration); return Number(hours?.[1] ?? 0) * 60 + Number(hours?.[2] ?? 0); }
  private layovers(segments: AmadeusFlightOffer['itineraries'][number]['segments']): Array<{ airport: string; minutes: number }> { return segments.slice(0, -1).map((segment, index) => ({ airport: segment.arrival.iataCode, minutes: Math.max(0, (new Date(segments[index + 1].departure.at).getTime() - new Date(segment.arrival.at).getTime()) / 60000) })); }
  private checkedBags(bags?: { quantity?: number; weight?: number; weightUnit?: string }): string { if (!bags) return 'See fare rules'; if (bags.quantity !== undefined) return `${bags.quantity} checked bag${bags.quantity === 1 ? '' : 's'}`; if (bags.weight !== undefined) return `${bags.weight}${bags.weightUnit ?? 'KG'} checked allowance`; return 'See fare rules'; }
  private score(price: number, duration: number, segmentCount: number): number { return Math.max(1, Math.round(10000 / Math.max(price, 1) + 3000 / Math.max(duration, 1) - segmentCount * 2)); }
}
