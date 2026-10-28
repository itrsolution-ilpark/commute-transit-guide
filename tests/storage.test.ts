import { describe, it, expect, beforeEach } from 'vitest';
import { getRoutes, saveRoutes, getRouteById, addRoute, updateRoute, deleteRoute, getSettings, saveSettings } from '../src/services/storage';

describe('LocalStorage Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial route when localStorage is empty', () => {
    const routes = getRoutes();
    expect(routes).toBeDefined();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0].id).toBe('route_1');
  });

  it('should add a new route correctly', () => {
    const newRouteData = {
      name: '테스트 경로',
      startName: '출발역',
      startStationId: '100',
      endName: '도착역',
      endStationId: '200',
      transportType: 'subway' as const,
      routeNo: '2호선',
      walkTimeMinutes: 5,
      isNotificationOn: true,
    };

    const added = addRoute(newRouteData);
    expect(added.id).toBeDefined();
    expect(added.name).toBe('테스트 경로');

    const routes = getRoutes();
    const found = routes.find((r) => r.id === added.id);
    expect(found).toBeDefined();
    expect(found?.routeNo).toBe('2호선');
  });

  it('should get route by id', () => {
    const routes = getRoutes();
    const firstRoute = routes[0];
    const found = getRouteById(firstRoute.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(firstRoute.id);
  });

  it('should update route correctly', () => {
    const routes = getRoutes();
    const targetId = routes[0].id;

    const updated = updateRoute(targetId, { name: '수정된 출근길', walkTimeMinutes: 10 });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('수정된 출근길');
    expect(updated?.walkTimeMinutes).toBe(10);
  });

  it('should delete route correctly', () => {
    const routes = getRoutes();
    const targetId = routes[0].id;

    const success = deleteRoute(targetId);
    expect(success).toBe(true);

    const remaining = getRoutes();
    expect(remaining.find((r) => r.id === targetId)).toBeUndefined();
  });

  it('should manage settings correctly', () => {
    const settings = getSettings();
    expect(settings).toBeDefined();
    expect(settings.autoRefreshInterval).toBe(30);

    saveSettings({
      autoRefreshInterval: 60,
      isGlobalNotificationEnabled: false,
    });

    const newSettings = getSettings();
    expect(newSettings.autoRefreshInterval).toBe(60);
    expect(newSettings.isGlobalNotificationEnabled).toBe(false);
  });
});
