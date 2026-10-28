import { useState } from 'react';
import { Route, TransitArrivalInfo, TransitSegment } from '../types';
import { Footprints, Bus, Train, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineProps {
  route: Route;
  arrivalInfo: TransitArrivalInfo | null;
}

export default function Timeline({ route, arrivalInfo }: TimelineProps) {
  const [expandedSegments, setExpandedSegments] = useState<Record<number, boolean>>({});

  const toggleSegment = (index: number) => {
    setExpandedSegments((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const segments = route.segments && route.segments.length > 0 ? route.segments : [
    { type: 'walk', name: '도보 이동', stations: [] },
    { type: 'subway', name: '지하철 2호선', startStation: '강남역', endStation: '선릉역', stations: ['강남역', '역삼역', '선릉역'] },
    { type: 'bus', name: '9000번 버스', startStation: '선릉역정류소', endStation: '판교테크노밸리', stations: ['선릉역정류소', '한티역', '판교테크노밸리'] }
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm">
      <h3 className="text-base font-bold text-[#0F172A] mb-4 tracking-tight">상세 경로 구간 리스트</h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2E8F0]">
        {segments.map((seg: TransitSegment, idx: number) => {
          const isWalk = seg.type === 'walk';
          const isSubway = seg.type === 'subway';
          const isBus = seg.type === 'bus';
          const isExpanded = !!expandedSegments[idx];

          return (
            <div key={idx} className="relative flex flex-col space-y-2">
              <div className="flex items-start space-x-3">
                <span
                  className={`absolute -left-6 top-0.5 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${
                    isWalk
                      ? 'bg-blue-100 text-[#2563EB]'
                      : isSubway
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isWalk ? (
                    <Footprints className="w-3.5 h-3.5" />
                  ) : isSubway ? (
                    <Train className="w-3.5 h-3.5" />
                  ) : (
                    <Bus className="w-3.5 h-3.5" />
                  )}
                </span>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-[#0F172A]">
                      {seg.name} {seg.startStation && seg.endStation ? `(${seg.startStation} ➔ ${seg.endStation})` : ''}
                    </div>

                    {!isWalk && seg.stations && seg.stations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleSegment(idx)}
                        className="flex items-center space-x-1 text-xs font-bold text-[#2563EB] hover:underline px-2 py-1 min-h-[32px]"
                      >
                        <span>정차역 전체 보기</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-[#64748B] mt-0.5">
                    {isWalk
                      ? `도보 이동 소요 시간: 약 ${route.walkTimeMinutes}분`
                      : isSubway
                      ? `지하철 구간 · 방면 정보 포함`
                      : `버스 구간 · 경유 정류장 포함`}
                  </div>
                </div>
              </div>

              {/* 정차역 목록 접기/펼치기 */}
              {isExpanded && seg.stations && seg.stations.length > 0 && (
                <div className="ml-2 pl-4 border-l-2 border-dashed border-[#CBD5E1] space-y-2 py-2 animate-fadeIn">
                  <div className="text-xs font-bold text-[#0F172A] mb-1">거쳐가는 정차역 목록:</div>
                  {seg.stations.map((stName, sIdx) => (
                    <div key={sIdx} className="flex items-center space-x-2 text-xs text-[#64748B]">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      <span className={sIdx === 0 || sIdx === seg.stations.length - 1 ? 'font-bold text-[#0F172A]' : ''}>
                        {stName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* 최종 도착지 */}
        <div className="relative flex items-start space-x-3">
          <span className="absolute -left-6 top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#EF4444] ring-4 ring-white">
            <MapPin className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="text-sm font-bold text-[#0F172A]">도착지: {route.endName}</div>
            <div className="text-xs text-[#64748B]">예상 도착 시각: {route.arrivalTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
