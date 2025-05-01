# Pont Chaban-Delmas Bridge Status

A web application that displays the current state of the Pont Chaban-Delmas bridge in Bordeaux, France, and provides an iCal feed for upcoming bridge closures.

## Features

- Real-time bridge status (open/closed)
- List of upcoming bridge closures
- iCal feed (.ics) for calendar integration
- Quick "Add to Calendar" links for Apple Calendar and Google Calendar
- Robust caching system (12-hour cache with automatic background refresh)
- Health check API endpoint
- Cache status headers in responses

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment variables:
   ```bash
   # .env file
   PORT=3000
   BASE_URL=http://localhost:3000  # Change this in production
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

4. Open http://localhost:3000 in your browser

## API Endpoints

- `/` - Main web page showing bridge status
- `/api/state` - JSON API endpoint for bridge state
- `/api/health` - Health check endpoint with cache status
- `/calendar.ics` - iCal feed of upcoming bridge closures
- `/swagger` - API documentation

## Response Headers

All API responses include an `X-Cache-Status` header indicating whether the data was served from the cache:

- `X-Cache-Status: HIT` - Data was served from the cache
- `X-Cache-Status: MISS` - Data was fetched from the external API

## Caching System

This application uses a robust caching system to minimize calls to the external API:

- Data is cached for 12 hours
- Background refresh runs every 6 hours
- Stale data is served during refresh operations
- Retry mechanism for failed API calls
- Graceful degradation when external services are down

## Data Source

This application uses the official Bordeaux Metropole API to fetch data about bridge closures:
https://datahub.bordeaux-metropole.fr/api/explore/v2.1/catalog/datasets/previsions_pont_chaban/records
