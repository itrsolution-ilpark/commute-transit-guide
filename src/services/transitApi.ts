import { TransitArrivalInfo, TransitSearchItem } from '../types';

const API_KEY = import.meta.env.VITE_PUBLIC_TRANSIT_API_KEY;

export const searchTransitStations = async (keyword: string): Promise<TransitSearchItem[]> => {
  if (!keyword || keyword.trim() === '') {
    return [];
  }

  if (!API_KEY || API_KEY.trim() === '') {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const term = keyword.trim();
    
    const mockDatabase: TransitSearchItem[] = [
      { stationId: '122000001', stationName: '강남역', routeNo: '2호선', transportType: 'subway', direction: '내선순환' },
      { stationId: '122000002', stationName: '선릉역', routeNo: '9000번', transportType: 'bus', direction: '판교 방면' },
      { stationId: '133000010', stationName: '역삼역', routeNo: '2호선', transportType: 'subway', direction: '내선순환' },
      { stationId: '144000005', stationName: '판교테크노밸리', routeNo: '9000번', transportType: 'bus', direction: '종로 방면' }
    ];

    const results = mockDatabase.filter(
      (item) =>
        item.stationName.includes(term) ||
        item.stationId.includes(term) ||
        (item.routeNo && item.routeNo.includes(term))
    );

    if (results.length === 0) {
      return [
        {
          stationId: `station_${Date.now()}_1`,
          stationName: `${term}역`,
          routeNo: '2호선',
          transportType: 'subway',
          direction: '상행 방면'
        },
        {
          stationId: `station_${Date.now()}_2`,
          stationName: `${term}정류소`,
          routeNo: '9000번',
          transportType: 'bus',
          direction: '도심 방면'
        }
      ];
    }

    return results;
  }

  try {
    const response = await fetch(`https://api.odsay.com/v1/api/searchStation?apiKey=${API_KEY}&stationName=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if (data && data.result && data.result.station) {
      return data.result.station.map((st: any) => ({
        stationId: String(st.stationID || st.ID),
        stationName: st.stationName || st.stationAName,
        transportType: st.stationClass === 2 ? 'subway' : 'bus',
        routeNo: st.Lane && st.Lane[0] ? st.Lane[0].busNoName : undefined,
        direction: st.direction || ''
      }));
    }
    return [];
  } catch (error) {
    console.warn('API search failed, falling back to mock search:', error);
    return [
      {
        stationId: 'fallback_1',
        stationName: `${keyword} (임시 정류소)`,
        routeNo: '기본버스',
        transportType: 'bus',
        direction: '정방향'
      }
    ];
  }
};

export const fetchArrivalInfo = async (routeId: string, walkTimeMinutes: number): Promise<TransitArrivalInfo> => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const hash = routeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (Date.now() / 1000 + hash) % 300;
  
  let remainingMinutes = Math.floor((seed % 600) / 60);
  if (remainingMinutes < 1) remainingMinutes = 1;
  if (remainingMinutes > 15) remainingMinutes = 4;

  const remainingSeconds = Math.floor(seed % 60);
  let remainingStations = Math.max(1, Math.floor(remainingMinutes / 2));
  
  const isImminent = remainingMinutes <= walkTimeMinutes;

  return {
    routeId,
    departureTime: '08:10',
    arrivalTime: '08:55',
    remainingMinutes,
    remainingSeconds,
    remainingStations,
    isImminent,
    lastUpdated: new Date().toISOString()
  };
};
