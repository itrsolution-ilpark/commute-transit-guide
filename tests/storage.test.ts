import { describe, it, expect, beforeEach } from 'vitest';
import { getRoutes, saveRoutes, getRouteById, addRoute, updateRoute, deleteRoute, getSettings, saveSettings } from '../src/services/storage';

describe('LocalStorage Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial route (9호선 가양역) when localStorage is empty', () => {
    const routes = getRoutes();
    expect(routes).toBeDefined();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0].id).toBe('route_1');
    expect(routes[0].startName).toBe('가양역');
    expect(routes[0].segments[1].name).toContain('9호선');
  });

  it('should add a new route correctly with segments', () => {
    const newRouteData = {
      name: '테스트 복합 경로',
      startName: '가양역',
      endName: '여의도역',
      departureTime: '08:30',
      arrivalTime: '09:15',
      walkTimeMinutes: 5,
      isNotificationOn: true,
      segments: [
        { type: 'walk' as const, name: '도보 이동', stations: [] },
        { type: 'subway' as const, name: '지하철 9호선', startStation: '가양역', endStation: '염창역', lineNo: '9호선', stations: ['가양역', '증미역', '염창역'] },
        { type: 'bus' as const, name: '601번 버스', startStation: '염창역정류소', endStation: '여의도환승센터', busNo: '601', stations: ['염창역정류소', '당산역', '여의도환승센터'] }
      ]
    };

    const added = addRoute(newRouteData);
    expect(added.id).toBeDefined();
    expect(added.name).toBe('테스트 복합 경로');
    expect(added.segments.length).toBe(3);

    const routes = getRoutes();
    const found = routes.find((r) => r.id === added.id);
    expect(found).toBeDefined();
    expect(found?.departureTime).toBe('08:30');
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

    const updated = updateRoute(targetId, { name: '수정된 출근길', walkTimeMinutes: 8 });
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('수정된 출근길');
    expect(updated?.walkTimeMinutes).toBe(8);
  });

  it('should delete route correctly', () => {
    const newRoute = addRoute({
      name: '추가된 경로',
      startName: 'A',
      endName: 'B',
      departureTime: '09:00',
      arrivalTime: '09:30',
      walkTimeMinutes: 5,
      isNotificationOn: false,
      segments: []
    });

    const successNew = deleteRoute(newRoute.id);
    expect(successNew).toBe(true);
    const updatedRemaining = getRoutes();
    expect(updatedRemaining.find((r) => r.id === newRoute.id)).toBeUndefined();
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
