export type TransportType = 'bus' | 'subway';

export interface Route {
  id: string;
  name: string;
  startName: string;
  startStationId: string;
  endName: string;
  endStationId: string;
  transportType: TransportType;
  routeNo: string;
  walkTimeMinutes: number;
  isNotificationOn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  autoRefreshInterval: number;
  isGlobalNotificationEnabled: boolean;
}

export interface TransitArrivalInfo {
  routeId: string;
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
