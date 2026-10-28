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
    expect(routes[0].segments).toBeDefined();
  });

  it('should add a new route correctly with segments', () => {
    const newRouteData = {
      name: '테스트 복합 경로',
      startName: '자택',
      endName: '회사',
      departureTime: '08:30',
      arrivalTime: '09:15',
      walkTimeMinutes: 5,
      isNotificationOn: true,
      segments: [
        { type: 'walk' as const, name: '도보 이동', stations: [] },
        { type: 'subway' as const, name: '지하철 2호선', stations: ['강남역', '선릉역'] }
      ]
    };

    const added = addRoute(newRouteData);
    expect(added.id).toBeDefined();
    expect(added.name).toBe('테스트 복합 경로');
    expect(added.segments.length).toBe(2);

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
    // 만약 초기 route_1을 삭제하여 비게 되면 getRoutes() 내부 가드에 의해 INITIAL_ROUTE가 다시 반환될 수 있으므로,
    // 여러 개를 등록한 뒤 특정 아이디를 삭제하는 것이 명확합니다.
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
