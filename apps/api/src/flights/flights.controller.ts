import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthenticatedUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AirlineQueryDto, AirportQueryDto, FavoriteRouteDto, FlightSearchDto, MultiCitySearchDto, TrackRouteDto } from './flights.dto.js';
import { FlightsService } from './flights.service.js';

@ApiTags('flights')
@Controller({ path: 'flights', version: '1' })
export class FlightsController {
  constructor(private readonly flights: FlightsService) {}
  @Post('search') search(@Body() dto: FlightSearchDto) { return this.flights.search(dto); }
  @Post('search/multi-city') multiCity(@Body() dto: MultiCitySearchDto) { return this.flights.multiCity(dto); }
  @Post('search/nearby') nearby(@Body() dto: FlightSearchDto) { return this.flights.nearby(dto); }
  @Post('offers/:id') offer(@Param('id') id: string, @Body() dto: FlightSearchDto) { return this.flights.offer(id, dto); }
  @Post('price-calendar') priceCalendar(@Body() dto: FlightSearchDto) { return this.flights.priceCalendar(dto); }
  @Get('airports') airports(@Query() query: AirportQueryDto) { return this.flights.airports(query); }
  @Get('airlines') airlines(@Query() query: AirlineQueryDto) { return this.flights.airlines(query); }
  @Post('tracking') @ApiBearerAuth() @UseGuards(JwtAuthGuard) track(@CurrentUser() user: AuthenticatedUser, @Body() dto: TrackRouteDto) { return this.flights.track(user.id, dto); }
  @Get('tracking') @ApiBearerAuth() @UseGuards(JwtAuthGuard) tracking(@CurrentUser() user: AuthenticatedUser) { return this.flights.tracking(user.id); }
  @Delete('tracking/:id') @ApiBearerAuth() @UseGuards(JwtAuthGuard) deleteTracking(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) { return this.flights.deleteTracking(user.id, id); }
  @Post('favorites') @ApiBearerAuth() @UseGuards(JwtAuthGuard) favorite(@CurrentUser() user: AuthenticatedUser, @Body() dto: FavoriteRouteDto) { return this.flights.favorite(user.id, dto); }
  @Get('favorites') @ApiBearerAuth() @UseGuards(JwtAuthGuard) favorites(@CurrentUser() user: AuthenticatedUser) { return this.flights.favorites(user.id); }
}
