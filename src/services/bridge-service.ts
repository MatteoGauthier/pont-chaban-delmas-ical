import { BordeauxMetropoleResponse, BridgeEvent, BridgeState } from '../types';
import ical from 'ical-generator';

const API_URL = 'https://datahub.bordeaux-metropole.fr/api/explore/v2.1/catalog/datasets/previsions_pont_chaban/records?limit=100';

export async function fetchBridgeData(): Promise<BordeauxMetropoleResponse> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch bridge data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching bridge data:', error);
    throw error;
  }
}

export function getBridgeState(): Promise<BridgeState> {
  return fetchBridgeData().then(data => {
    const now = new Date();
    const events = data.results.sort((a, b) => {
      const dateA = parseBridgeEventDate(a);
      const dateB = parseBridgeEventDate(b);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Find current event (if bridge is elevated)
    const currentEvent = events.find(event => {
      const { startDate, endDate } = getBridgeEventDates(event);
      return now >= startDate && now <= endDate;
    });
    
    // Get upcoming events
    const upcomingEvents = events.filter(event => {
      const { startDate } = getBridgeEventDates(event);
      return startDate > now;
    });
    
    return {
      isElevated: !!currentEvent,
      currentEvent,
      upcomingEvents
    };
  });
}

export function generateICalendar(): Promise<string> {
  return fetchBridgeData().then(data => {
    const calendar = ical({
      name: 'Pont Chaban-Delmas - Fermetures',
      description: 'Calendrier des fermetures du Pont Chaban-Delmas à Bordeaux',
      timezone: 'Europe/Paris'
    });
    
    data.results.forEach(event => {
      const { startDate, endDate } = getBridgeEventDates(event);
      
      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: `Fermeture Pont Chaban-Delmas - ${event.bateau}`,
        description: `Type de fermeture: ${event.type_de_fermeture}, Fermeture totale: ${event.fermeture_totale}`,
        location: 'Pont Chaban-Delmas, Bordeaux, France'
      });
    });
    
    return calendar.toString();
  });
}

// Helper function to parse a bridge event date
function parseBridgeEventDate(event: BridgeEvent): Date {
  // Combine date and time
  const [year, month, day] = event.date_passage.split('-').map(Number);
  const [hours, minutes] = event.fermeture_a_la_circulation.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes);
}

// Helper function to get start and end dates for a bridge event
export function getBridgeEventDates(event: BridgeEvent): { startDate: Date, endDate: Date } {
  // Parse date parts
  const [year, month, day] = event.date_passage.split('-').map(Number);
  
  // Parse closing time
  const [closingHours, closingMinutes] = event.fermeture_a_la_circulation.split(':').map(Number);
  const startDate = new Date(year, month - 1, day, closingHours, closingMinutes);
  
  // Parse opening time
  const [openingHours, openingMinutes] = event.re_ouverture_a_la_circulation.split(':').map(Number);
  
  // Handle cases where opening time is on the next day (e.g., closing at 23:00, opening at 05:00)
  let endDate = new Date(year, month - 1, day, openingHours, openingMinutes);
  if (openingHours < closingHours) {
    // Add one day if opening time is earlier than closing time
    endDate.setDate(endDate.getDate() + 1);
  }
  
  return { startDate, endDate };
} 
