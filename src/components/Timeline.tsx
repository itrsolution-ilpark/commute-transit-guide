import { Route, TransitArrivalInfo } from '../types';
import { Footprints, Bus, Train, MapPin } from 'lucide-react';

interface TimelineProps {
  route: Route;
  arrivalInfo: TransitArrivalInfo | null;
}

export default function Timeline({ route, arrivalInfo }: TimelineProps) {
  const isBus = route.transportType === 'bus';
  const remainingStations = arrivalInfo ? arrivalInfo.remainingStations : 2;

  // 가상의 경유 정류장 목록 생성
  const stations = [];
  for (let i = remainingStations; i >= 1; i--) {
    stations.push({
      name: `${i}정거장 전 경유지`,
      isCurrent: i === remainingStations,
    });
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm">
      <h3 className="text-base font-bold text-[#0F172A] mb-4 tracking-tight">전체 이동 타임라인</h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2E8F0]">
        {/* 출발지 (도보 구간) */}
        <div className="relative flex items-start space-x-3">
          <span className="absolute -left-6 top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] ring-4 ring-white">
            <Footprints className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="text-sm font-bold text-[#0F172A]">출발지: {route.startName}</div>
            <div className="text-xs text-[#64748B]">도보 이동 소요 시간: 약 {route.walkTimeMinutes}분</div>
          </div>
        </div>

        {/* 승차 정류장 / 역 */}
        <div className="relative flex items-start space-x-3">
          <span
            className={`absolute -left-6 top-0.5 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${
              isBus ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isBus ? <Bus className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
          </span>
          <div>
            <div className="text-sm font-bold text-[#0F172A]">
              탑승: {route.startName} ({route.routeNo})
            </div>
            <div className="text-xs text-[#10B981] font-semibold mt-0.5">
              {arrivalInfo
                ? `${arrivalInfo.remainingMinutes}분 ${arrivalInfo.remainingSeconds}초 후 도착 예정`
                : '도착 정보 확인 중'}
            </div>
          </div>
        </div>

        {/* 경유 정류장들 */}
        {stations.map((st, idx) => (
          <div key={idx} className="relative flex items-start space-x-3">
            <span className="absolute -left-6 top-1.5 flex items-center justify-center w-3 h-3 rounded-full bg-[#CBD5E1] ring-4 ring-white" />
            <div>
              <div className="text-xs font-medium text-[#64748B]">{st.name}</div>
            </div>
          </div>
        ))}

        {/* 도착지 */}
        <div className="relative flex items-start space-x-3">
          <span className="absolute -left-6 top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#EF4444] ring-4 ring-white">
            <MapPin className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="text-sm font-bold text-[#0F172A]">도착지: {route.endName}</div>
            <div className="text-xs text-[#64748B]">최종 목적지</div>
          </div>
        </div>
      </div>
    </div>
  );
}
