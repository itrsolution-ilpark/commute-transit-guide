export type TransportType = 'walk' | 'subway' | 'bus';

export interface TransitSegment {
  type: TransportType;
  name: string;
  startStation?: string;
  endStation?: string;
  stations: string[];
}

export interface Route {
  id: string;
  name: string;
  startName: string;
  endName: string;
  departureTime: string;
  arrivalTime: string;
  walkTimeMinutes: number;
  isNotificationOn: boolean;
  segments: TransitSegment[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  autoRefreshInterval: number;
  isGlobalNotificationEnabled: boolean;
}

export interface TransitArrivalInfo {
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  remainingMinutes: number;
  remainingSeconds: number;
  remainingStations: number;
  isImminent: boolean;
  lastUpdated: string;
}

export interface TransitSearchItem {
  stationId: string;
  stationName: string;
  routeNo?: string;
  transportType: TransportType;
  direction?: string;
}
