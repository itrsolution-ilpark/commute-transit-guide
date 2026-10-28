import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Footprints, Plus, Train, Bus as BusIcon } from 'lucide-react';
import { TransitSearchItem, TransitSegment } from '../types';
import { searchTransitStations } from '../services/transitApi';
import { addRoute } from '../services/storage';
import Header from '../components/Header';
import Toast from '../components/Toast';

export default function SearchPage() {
  const navigate = useNavigate();

  const [routeName, setRouteName] = useState<string>('');
  const [startKeyword, setStartKeyword] = useState<string>('');
  const [endKeyword, setEndKeyword] = useState<string>('');
  
  const [startItems, setStartItems] = useState<TransitSearchItem[]>([]);
  const [endItems, setEndItems] = useState<TransitSearchItem[]>([]);
  
  const [selectedStart, setSelectedStart] = useState<TransitSearchItem | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<TransitSearchItem | null>(null);

  // 지하철 노선번호 선택 및 버스 정류소명 선택 상태
  const [selectedSubwayLine, setSelectedSubwayLine] = useState<string>('2호선');
  const [selectedBusStationName, setSelectedBusStationName] = useState<string>('선릉역정류소');

  const [departureTime, setDepartureTime] = useState<string>('08:10');
  const [arrivalTime, setArrivalTime] = useState<string>('08:55');
  const [walkTimeMinutes, setWalkTimeMinutes] = useState<number>(7);

  const [isStartSearching, setIsStartSearching] = useState<boolean>(false);
  const [isEndSearching, setIsEndSearching] = useState<boolean>(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('error');

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (startKeyword.trim().length > 0 && !selectedStart) {
        setIsStartSearching(true);
        try {
          const results = await searchTransitStations(startKeyword);
          setStartItems(results);
        } catch (error) {
          console.error(error);
          setStartItems([]);
        } finally {
          setIsStartSearching(false);
        }
      } else {
        setStartItems([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [startKeyword, selectedStart]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (endKeyword.trim().length > 0 && !selectedEnd) {
        setIsEndSearching(true);
        try {
          const results = await searchTransitStations(endKeyword);
          setEndItems(results);
        } catch (error) {
          console.error(error);
          setEndItems([]);
        } finally {
          setIsEndSearching(false);
        }
      } else {
        setEndItems([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [endKeyword, selectedEnd]);

  const handleSelectStart = (item: TransitSearchItem) => {
    setSelectedStart(item);
    setStartKeyword(item.stationName);
    if (item.routeNo) {
      setSelectedSubwayLine(item.routeNo);
    }
    setStartItems([]);
  };

  const handleSelectEnd = (item: TransitSearchItem) => {
    setSelectedEnd(item);
    setEndKeyword(item.stationName);
    if (item.stationName) {
      setSelectedBusStationName(`${item.stationName}정류소`);
    }
    setEndItems([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStart && !startKeyword.trim()) {
      setToastMessage('검색 결과가 없습니다. 출발지와 도착지를 다시 확인해주세요.');
      setToastType('error');
      return;
    }

    if (!selectedEnd && !endKeyword.trim()) {
      setToastMessage('검색 결과가 없습니다. 출발지와 도착지를 다시 확인해주세요.');
      setToastType('error');
      return;
    }

    const startName = selectedStart ? selectedStart.stationName : startKeyword;
    const endName = selectedEnd ? selectedEnd.stationName : endKeyword;
    const finalRouteName = routeName.trim() || `${startName} ➔ ${endName} 출근길`;

    const segments: TransitSegment[] = [
      {
        type: 'walk',
        name: '도보 이동',
        stations: []
      },
      {
        type: 'subway',
        name: `지하철 ${selectedSubwayLine}`,
        startStation: startName,
        endStation: '선릉역',
        lineNo: selectedSubwayLine,
        stations: [startName, '역삼역', '선릉역']
      },
      {
        type: 'bus',
        name: '9000번 버스',
        startStation: selectedBusStationName,
        endStation: endName,
        stationName: selectedBusStationName,
        stations: [selectedBusStationName, '한티역', endName]
      }
    ];

    addRoute({
      name: finalRouteName,
      startName,
      endName,
      departureTime: departureTime.trim() || '08:10',
      arrivalTime: arrivalTime.trim() || '08:55',
      walkTimeMinutes: Number(walkTimeMinutes),
      isNotificationOn: true,
      segments,
    });

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 flex flex-col">
      <Header title="새 경로 추가" showBack={true} />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 설정 폼: 경로 별칭 입력 인풋 */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 shadow-sm space-y-4">
            <div>
              <label htmlFor="routeName" className="block text-sm font-bold text-[#0F172A] mb-1">
                경로 별칭 (선택)
              </label>
              <input
                id="routeName"
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="예: 회사 출근길"
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="departureTime" className="block text-sm font-bold text-[#0F172A] mb-1">
                  출발 시각
                </label>
                <input
                  id="departureTime"
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="08:10"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A]"
                />
              </div>
              <div>
                <label htmlFor="arrivalTime" className="block text-sm font-bold text-[#0F172A] mb-1">
                  예상 도착 시각
                </label>
                <input
                  id="arrivalTime"
                  type="text"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  placeholder="08:55"
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A]"
                />
              </div>
            </div>
          </div>

          {/* 상세 검색 폼: 지하철 노선번호 선택 및 버스 정류소명 선택 반영 */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 shadow-sm space-y-4 relative">
            <div>
              <label htmlFor="startInput" className="block text-sm font-bold text-[#0F172A] mb-1">
                출발지 역명 (지하철)
              </label>
              <div className="relative">
                <input
                  id="startInput"
                  type="text"
                  value={startKeyword}
                  onChange={(e) => {
                    setStartKeyword(e.target.value);
                    if (selectedStart) setSelectedStart(null);
                  }}
                  placeholder="역명 입력 (예: 강남역)"
                  required
                  aria-label="출발지 역명"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
                <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[#64748B]" />
                {isStartSearching && (
                  <div className="absolute right-3.5 top-3.5 w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {startItems.length > 0 && (
                <ul className="absolute z-20 left-4 right-4 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {startItems.map((item) => (
                    <li
                      key={item.stationId}
                      onClick={() => handleSelectStart(item)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">{item.stationName}</div>
                        {item.direction && <div className="text-xs text-[#64748B]">{item.direction}</div>}
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-[#64748B]">
                        {item.routeNo || item.transportType}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 지하철 노선번호 선택 셀렉트박스 */}
            <div>
              <label htmlFor="subwayLineSelect" className="block text-xs font-bold text-[#64748B] mb-1 flex items-center space-x-1">
                <Train className="w-4 h-4 text-[#2563EB]" />
                <span>지하철 노선번호 선택</span>
              </label>
              <select
                id="subwayLineSelect"
                value={selectedSubwayLine}
                onChange={(e) => setSelectedSubwayLine(e.target.value)}
                aria-label="지하철 노선번호"
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="1호선">1호선</option>
                <option value="2호선">2호선</option>
                <option value="3호선">3호선</option>
                <option value="4호선">4호선</option>
                <option value="5호선">5호선</option>
                <option value="신분당선">신분당선</option>
                <option value="수인분당선">수인분당선</option>
                <option value="공항철도">공항철도</option>
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label htmlFor="endInput" className="block text-sm font-bold text-[#0F172A] mb-1">
                도착지 명칭 (버스 정류소/목적지)
              </label>
              <div className="relative">
                <input
                  id="endInput"
                  type="text"
                  value={endKeyword}
                  onChange={(e) => {
                    setEndKeyword(e.target.value);
                    if (selectedEnd) setSelectedEnd(null);
                  }}
                  placeholder="정류소명 또는 도착지 입력 (예: 선릉역정류소)"
                  required
                  aria-label="도착지 명칭"
                  className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
                />
                <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-[#64748B]" />
                {isEndSearching && (
                  <div className="absolute right-3.5 top-3.5 w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {endItems.length > 0 && (
                <ul className="absolute z-20 left-4 right-4 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {endItems.map((item) => (
                    <li
                      key={item.stationId}
                      onClick={() => handleSelectEnd(item)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-none flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">{item.stationName}</div>
                        {item.direction && <div className="text-xs text-[#64748B]">{item.direction}</div>}
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-[#64748B]">
                        {item.routeNo || item.transportType}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 버스 정류소명 직접 지정 인풋 */}
            <div>
              <label htmlFor="busStationInput" className="block text-xs font-bold text-[#64748B] mb-1 flex items-center space-x-1">
                <BusIcon className="w-4 h-4 text-[#2563EB]" />
                <span>버스 정류소명(또는 정류소 번호) 선택</span>
              </label>
              <input
                id="busStationInput"
                type="text"
                value={selectedBusStationName}
                onChange={(e) => setSelectedBusStationName(e.target.value)}
                placeholder="예: 선릉역정류소 또는 23145"
                aria-label="버스 정류소명"
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* 도보 소요 시간 슬라이더 */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="walkTimeRange" className="text-sm font-bold text-[#0F172A] flex items-center space-x-1.5">
                <Footprints className="w-4 h-4 text-[#2563EB]" />
                <span>도보 이동 소요 시간</span>
              </label>
              <span className="text-base font-extrabold text-[#2563EB]">{walkTimeMinutes}분</span>
            </div>
            <input
              id="walkTimeRange"
              type="range"
              min="1"
              max="30"
              value={walkTimeMinutes}
              onChange={(e) => setWalkTimeMinutes(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
            />
            <div className="flex justify-between text-xs text-[#64748B]">
              <span>1분</span>
              <span>15분</span>
              <span>30분</span>
            </div>
          </div>

          {/* 하단 고정 [경로 저장하기] 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E2E8F0] shadow-lg md:relative md:bg-transparent md:border-none md:p-0 md:shadow-none">
            <button
              type="submit"
              className="w-full py-4 bg-[#2563EB] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors min-h-[44px] flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>경로 저장하기</span>
            </button>
          </div>
        </form>
      </main>

      {/* 토스트 메시지 */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
