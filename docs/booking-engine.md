# Booking Engine Architecture

Phase 4 implements an authenticated booking lifecycle from selected offer through passenger capture, seat holds, baggage, ancillary services, fare confirmation, ticket issuance, invoice generation, boarding pass generation, cancellation, and trip management.

## Flow

```text
Search Flight -> Select Offer -> Passenger Details -> Seat Selection -> Baggage -> Ancillary Services -> Fare Confirmation -> Payment Intent -> Booking Confirmation -> Ticket Issuance -> Invoice -> Trip Management
```

## Endpoints

- `POST /v1/bookings`
- `GET /v1/bookings`
- `GET /v1/bookings/:id`
- `PATCH /v1/bookings/:id`
- `DELETE /v1/bookings/:id`
- `POST /v1/bookings/:id/passengers`
- `POST /v1/bookings/:id/seats`
- `POST /v1/bookings/:id/baggage`
- `POST /v1/bookings/:id/ancillary`
- `POST /v1/bookings/:id/confirm`
- `POST /v1/bookings/:id/cancel`
- `GET /v1/bookings/:id/ticket`
- `GET /v1/bookings/:id/invoice`
- `GET /v1/bookings/:id/boarding-pass`

## Documents

The API creates base64 PDF artifacts for invoices, electronic tickets, and boarding passes during confirmation. Production storage can persist these documents through the existing storage boundary in a later deployment-specific integration.
