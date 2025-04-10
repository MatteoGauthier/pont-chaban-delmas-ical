export interface BridgeEvent {
  bateau: string;
  date_passage: string;
  fermeture_a_la_circulation: string;
  re_ouverture_a_la_circulation: string;
  type_de_fermeture: string;
  fermeture_totale: string;
}

export interface BordeauxMetropoleResponse {
  total_count: number;
  results: BridgeEvent[];
}

export interface BridgeState {
  isElevated: boolean;
  currentEvent?: BridgeEvent;
  upcomingEvents: BridgeEvent[];
} 
