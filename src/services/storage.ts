import { Route, Settings } from '../types';

const ROUTES_KEY = 'commute_routes';
const SETTINGS_KEY = 'commute_settings';

const INITIAL_ROUTE: Route = {
  id: 'route_1',
  name: '출근길',
  startName: '가양역',
  endName: '여의도역',
  departureTime: '08:10',
  arrivalTime: '08:35',
  walkTimeMinutes: 5,
  isNotificationOn: true,
  segments: [
    {
      type: 'walk',
      name: '도보 이동',
      durationMinutes: 5,
      stations: []
    } as any,
    {
      type: 'subway',
      name: '지하철 9호선',
      startStation: '가양역',
      endStation: '염창역',
      lineNo: '9호선',
      stations: ['가양역', '증미역', '염창역']
    },
    {
      type: 'bus',
      name: '601번 버스',
      startStation: '염창역정류소',
      endStation: '여의도환승센터',
      busNo: '601',
      stations: ['염창역정류소', '당산역', '여의도환승센터']
    }
  ],
  createdAt: '2026-03-30T08:00:00.000Z',
  updatedAt: '2026-03-30T08:00:00.000Z'
};

const INITIAL_SETTINGS: Settings = {
  autoRefreshInterval: 30,
  isGlobalNotificationEnabled: true
};

export const getRoutes = (): Route[] => {
  try {
    const data = localStorage.getItem(ROUTES_KEY);
    if (!data) {
      saveRoutes([INITIAL_ROUTE]);
      return [INITIAL_ROUTE];
    }
    const parsed: Route[] = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveRoutes([INITIAL_ROUTE]);
      return [INITIAL_ROUTE];
    }
    return parsed;
  } catch (error) {
    console.error('Failed to load routes from localStorage', error);
    return [INITIAL_ROUTE];
  }
};

export const saveRoutes = (routes: Route[]): void => {
  try {
    localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
  } catch (error) {
    console.error('Failed to save routes to localStorage', error);
  }
};

export const getRouteById = (id: string): Route | null => {
  const routes = getRoutes();
  return routes.find((r) => r.id === id) || null;
};

export const addRoute = (newRouteData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Route => {
  const routes = getRoutes();
  const now = new Date().toISOString();
  const newRoute: Route = {
    ...newRouteData,
    id: `route_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: now,
    updatedAt: now
  };
  routes.push(newRoute);
  saveRoutes(routes);
  return newRoute;
};

export const updateRoute = (id: string, updatedFields: Partial<Route>): Route | null => {
  const routes = getRoutes();
  let updatedRoute: Route | null = null;
  const newRoutes = routes.map((route) => {
    if (route.id === id) {
      updatedRoute = {
        ...route,
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      return updatedRoute;
    }
    return route;
  });
  if (updatedRoute) {
    saveRoutes(newRoutes);
  }
  return updatedRoute;
};

export const deleteRoute = (id: string): boolean => {
  const routes = getRoutes();
  const filtered = routes.filter((r) => r.id !== id);
  if (filtered.length === routes.length) {
    return false;
  }
  saveRoutes(filtered);
  return true;
};

export const getSettings = (): Settings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load settings from localStorage', error);
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage', error);
  }
};
