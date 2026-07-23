# Flight Search Architecture

Phase 3 adds a provider-backed flight search engine. `AmadeusService` owns OAuth token acquisition, token caching, retry handling for transient provider failures, and mapping Amadeus offers into the Nexaris flight-offer contract. `FlightsService` owns search orchestration, Redis-backed response caching, filtering, sorting, price-calendar expansion, and analytics persistence.

## Endpoints

- `POST /v1/flights/search` for one-way and round-trip search.
- `POST /v1/flights/search/multi-city` for multi-city itineraries.
- `POST /v1/flights/search/nearby` for nearby airport search expansion.
- `POST /v1/flights/offers/:id` to resolve an offer from a current search request.
- `POST /v1/flights/price-calendar` for flexible-date lowest fares.
- `GET /v1/flights/airports` for airport autocomplete and city/country search.
- `GET /v1/flights/airlines` for airline lookup and filtering.
- `POST /v1/flights/tracking` and `GET /v1/flights/tracking` for authenticated route tracking.
- `POST /v1/flights/favorites` and `GET /v1/flights/favorites` for authenticated favorite routes.

## Data

The database now includes airports, airlines, search history, Redis-compatible flight cache metadata, tracked routes, price history, favorite routes, and search analytics.
