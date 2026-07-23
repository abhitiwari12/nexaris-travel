import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module.js';
import { AmadeusService } from './amadeus/amadeus.service.js';
import { FlightsController } from './flights.controller.js';
import { FlightsService } from './flights.service.js';
import { FlightsRepository } from './repositories/flights.repository.js';
@Module({ imports: [CacheModule], controllers: [FlightsController], providers: [FlightsService, AmadeusService, FlightsRepository], exports: [FlightsService] })
export class FlightsModule {}
