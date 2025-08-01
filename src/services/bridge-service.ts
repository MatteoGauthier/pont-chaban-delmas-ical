import { BordeauxMetropoleResponse, BridgeEvent, BridgeState } from "../types"
import ical from "ical-generator"
import { CacheService } from "./cache-service"

const API_URL =
  "https://datahub.bordeaux-metropole.fr/api/explore/v2.1/catalog/datasets/previsions_pont_chaban/records?limit=100"

// Create cache service for bridge data
const bridgeDataCache = new CacheService<BordeauxMetropoleResponse>(
  async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { "User-Agent": "pontchaban.com/1.0" },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bridge data: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error("Error fetching bridge data:", error)
      throw error
    }
  },
  {
    cacheTTL: 12 * 60 * 60 * 1000, // 12 hours
    refreshInterval: 6 * 60 * 60 * 1000, // 6 hours (refresh halfway through TTL)
  }
)

// Initialize cache on module load
bridgeDataCache.startAutoRefresh()

export async function fetchBridgeData(): Promise<BordeauxMetropoleResponse> {
  return bridgeDataCache.getData()
}

export function wasDataServedFromCache(): boolean {
  return bridgeDataCache.wasDataServedFromCache();
}

export function getBridgeState(): Promise<BridgeState> {
  return fetchBridgeData().then((data) => {
    const now = new Date()
    const events = data.results.sort((a, b) => {
      const dateA = parseBridgeEventDate(a)
      const dateB = parseBridgeEventDate(b)
      return dateA.getTime() - dateB.getTime()
    })

    const currentEvent = events.find((event) => {
      const { startDate, endDate } = getBridgeEventDates(event)
      return now >= startDate && now <= endDate
    })

    const upcomingEvents = events.filter((event) => {
      const { startDate } = getBridgeEventDates(event)
      return startDate > now
    })

    return {
      isElevated: !!currentEvent,
      currentEvent,
      upcomingEvents,
    }
  })
}

export function generateICalendar(): Promise<string> {
  return fetchBridgeData().then((data) => {
    const calendar = ical({
      name: "Pont Chaban-Delmas - Fermetures",
      description: "Calendrier des fermetures du Pont Chaban-Delmas à Bordeaux",
      timezone: "Europe/Paris",
    })

    data.results.forEach((event) => {
      const { startDate, endDate } = getBridgeEventDates(event)

      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: `Fermeture Pont Chaban-Delmas - ${event.bateau}`,
        description: `Type de fermeture: ${event.type_de_fermeture}, Fermeture totale: ${event.fermeture_totale}`,
        location: "Pont Chaban-Delmas, Bordeaux, France",
      })
    })

    return calendar.toString()
  })
}

function parseBridgeEventDate(event: BridgeEvent): Date {
  const [year, month, day] = event.date_passage.split("-").map(Number)
  const [hours, minutes] = event.fermeture_a_la_circulation.split(":").map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

export function getBridgeEventDates(event: BridgeEvent): { startDate: Date; endDate: Date } {
  const [year, month, day] = event.date_passage.split("-").map(Number)

  const [closingHours, closingMinutes] = event.fermeture_a_la_circulation.split(":").map(Number)
  const startDate = new Date(year, month - 1, day, closingHours, closingMinutes)

  const [openingHours, openingMinutes] = event.re_ouverture_a_la_circulation.split(":").map(Number)

  let endDate = new Date(year, month - 1, day, openingHours, openingMinutes)
  if (openingHours < closingHours) {
    endDate.setDate(endDate.getDate() + 1)
  }

  return { startDate, endDate }
}

export function getCacheStatus() {
  return bridgeDataCache.getCacheStatus()
}
