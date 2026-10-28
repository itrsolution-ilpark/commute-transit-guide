import { describe, it, expect } from 'vitest';
import { searchTransitStations, fetchArrivalInfo } from '../src/services/transitApi';

describe('Transit API Service', () => {
  it('should return empty array for empty keyword', async () => {
    const results = await searchTransitStations('');
    expect(results).toEqual([]);
  });

  it('should search mock transit stations correctly', async () => {
    const results = await searchTransitStations('강남역');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].stationName).toContain('강남역');
  });

  it('should return fallback search item when keyword does not match', async () => {
    const results = await searchTransitStations('존재하지않는정류소xyz');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
  });

  it('should fetch arrival info correctly', async () => {
    const info = await fetchArrivalInfo('route_1', 7);
    expect(info).toBeDefined();
    expect(info.routeId).toBe('route_1');
    expect(typeof info.remainingMinutes).toBe('number');
    expect(typeof info.remainingSeconds).toBe('number');
    expect(typeof info.remainingStations).toBe('number');
    expect(typeof info.isImminent).toBe('boolean');
    expect(info.lastUpdated).toBeDefined();
  });
});
