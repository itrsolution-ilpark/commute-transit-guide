import { TransitArrivalInfo, TransitSearchItem } from '../types';

const API_KEY = import.meta.env.VITE_PUBLIC_TRANSIT_API_KEY;

export const searchTransitStations = async (keyword: string): Promise<TransitSearchItem[]> => {
  if (!keyword || keyword.trim() === '') {
    return [];
  }

  // API 키가 없거나 공공 API 호출 실패 시 Mock 데이터 반환
  if (!API_KEY || API_KEY.trim() === '') {
    // 인공 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300));
    const term = keyword.trim();
    
    const mockDatabase: TransitSearchItem[] = [
      { stationId: '122000001', stationName: '강남역 2번출구', routeNo: '9000번', transportType: 'bus', direction: '판교 방면' },
      { stationId: '122000002', stationName: '판교역', routeNo: '9000번', transportType: 'bus', direction: '종로 방면' },
      { stationId: '133000010', stationName: '역삼역', routeNo: '2호선', transportType: 'subway', direction: '내선순환' },
      { stationId: '133000020', stationName: '선릉역', routeNo: '2호선', transportType: 'subway', direction: '외선순환' },
      { stationId: '144000005', stationName: '사당역', routeNo: '7770번', transportType: 'bus', direction: '수원 방면' },
      { stationId: '155000012', stationName: '합정역', routeNo: '2호선', transportType: 'subway', direction: '홍대입구 방면' }
    ];

    const results = mockDatabase.filter(
      (item) =>
        item.stationName.includes(term) ||
        item.stationId.includes(term) ||
        (item.routeNo && item.routeNo.includes(term))
    );

    if (results.length === 0) {
      // 키워드에 매칭되는 항목이 없으면 기본 가상 검색 결과 생성
      return [
        {
          stationId: `station_${Date.now()}_1`,
          stationName: `${term} 정류소`,
          routeNo: '1001번',
          transportType: 'bus',
          direction: '도심 방면'
        },
        {
          stationId: `station_${Date.now()}_2`,
          stationName: `${term}역`,
          routeNo: '신분당선',
          transportType: 'subway',
          direction: '상행 방면'
        }
      ];
    }

    return results;
  }

  try {
    // 실제 API 연동 구간 (공공데이터포털 버스/지하철 정류소 검색 API 연동 지점)
    // 현재는 구조만 잡아두고 실제 키가 있을 때 확장할 수 있도록 함
    const response = await fetch(`https://api.odsay.com/v1/api/searchStation?apiKey=${API_KEY}&stationName=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // ODsay나 공공데이터 표준 응답 파싱 로직 위치
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
  // 인공 네트워크 지연 (200ms ~ 500ms)
  await new Promise((resolve) => setTimeout(resolve, 350));

  // 항상 안정적으로 동작하는 Mock 실시간 도착 데이터 생성
  // routeId 값에 따라 약간의 랜덤성을 부여하되 일관된 흐름 유지
  const hash = routeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (Date.now() / 1000 + hash) % 300; // 5분 주기 순환
  
  // 남은 분 (0분 ~ 12분 사이)
  let remainingMinutes = Math.floor((seed % 600) / 60);
  if (remainingMinutes < 1) remainingMinutes = 1;
  if (remainingMinutes > 15) remainingMinutes = 4;

  const remainingSeconds = Math.floor(seed % 60);
  let remainingStations = Math.max(1, Math.floor(remainingMinutes / 2));
  
  const isImminent = remainingMinutes <= walkTimeMinutes;

  return {
    routeId,
    remainingMinutes,
    remainingSeconds,
    remainingStations,
    isImminent,
    lastUpdated: new Date().toISOString()
  };
};
