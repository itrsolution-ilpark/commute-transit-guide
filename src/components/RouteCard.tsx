import { useState, useEffect } from 'react';
import { Bus, Train, Bell, BellOff, Trash2, ChevronRight } from 'lucide-react';
import { Route, TransitArrivalInfo } from '../types';
import { fetchArrivalInfo } from '../services/transitApi';
import { sendTransitNotification } from '../services/notification';

interface RouteCardProps {
  route: Route;
  onDelete: (id: string) => void;
  onToggleNotification: (id: string, currentStatus: boolean) => void;
  onCardClick: (id: string) => void;
  refreshTrigger?: number;
}

export default function RouteCard({
  route,
  onDelete,
  onToggleNotification,
  onCardClick,
  refreshTrigger = 0,
}: RouteCardProps) {
  const [arrivalInfo, setArrivalInfo] = useState<TransitArrivalInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasNotified, setHasNotified] = useState<boolean>(false);

  const loadArrival = async () => {
    setIsLoading(true);
    try {
      const data = await fetchArrivalInfo(route.id, route.walkTimeMinutes);
      setArrivalInfo(data);

      if (
        route.isNotificationOn &&
        !hasNotified &&
        data.remainingMinutes <= route.walkTimeMinutes
      ) {
        sendTransitNotification(route.name, route.routeNo, data.remainingMinutes);
        setHasNotified(true);
      }
    } catch (error) {
      console.error('Failed to fetch arrival info for card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArrival();
  }, [route.id, route.walkTimeMinutes, refreshTrigger]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(route.id);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleNotification(route.id, route.isNotificationOn);
  };

  return (
    <div
      onClick={() => onCardClick(route.id)}
      className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative flex flex-col justify-between"
    >
      <div>
        {/* 상단: 교통수단 뱃지 및 경로 이름, 삭제 버튼 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                route.transportType === 'bus'
                  ? 'bg-blue-100 text-[#2563EB]'
                  : 'bg-emerald-100 text-[#10B981]'
              }`}
            >
              {route.transportType === 'bus' ? (
                <Bus className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Train className="w-3.5 h-3.5 mr-1" />
              )}
              {route.routeNo}
            </span>
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight truncate max-w-[180px] sm:max-w-[240px]">
              {route.name}
            </h3>
          </div>

          <button
            onClick={handleDeleteClick}
            aria-label="경로 삭제"
            className="flex items-center justify-center w-11 h-11 text-[#64748B] hover:text-[#EF4444] rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* 출발지 -> 도착지 정보 */}
        <div className="text-xs text-[#64748B] mb-4 flex items-center space-x-1">
          <span className="font-medium text-[#0F172A]">{route.startName}</span>
          <span>→</span>
          <span className="font-medium text-[#0F172A]">{route.endName}</span>
        </div>

        {/* 실시간 도착 정보 섹션 */}
        <div className="bg-[#F8FAFC] rounded-lg p-3 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#64748B] mb-0.5">실시간 도착 정보</div>
            {isLoading && !arrivalInfo ? (
              <div className="text-sm font-semibold text-[#64748B] animate-pulse">조회 중...</div>
            ) : arrivalInfo ? (
              <div className="text-[22px] font-extrabold text-[#10B981] leading-tight">
                {arrivalInfo.remainingMinutes}분 {arrivalInfo.remainingSeconds}초 후 도착
              </div>
            ) : (
              <div className="text-sm font-semibold text-[#EF4444]">정보 없음</div>
            )}
          </div>
          {arrivalInfo && (
            <div className="text-right">
              <div className="text-xs text-[#64748B] mb-0.5">남은 정거장</div>
              <div className="text-sm font-bold text-[#0F172A]">
                {arrivalInfo.remainingStations}정거장 전
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단: 도보 소요 시간, 알림 토글, 상세 이동 화살표 */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
        <div className="text-xs text-[#64748B]">
          도보 이동 소요 시간: <span className="font-bold text-[#0F172A]">{route.walkTimeMinutes}분</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 알림 토글 스위치 (가로 48px, 세로 28px) */}
          <button
            onClick={handleToggleClick}
            aria-label={route.isNotificationOn ? '알림 끄기' : '알림 켜기'}
            className={`relative inline-flex items-center h-[28px] w-[48px] rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2563EB]`}
            style={{
              backgroundColor: route.isNotificationOn ? '#2563EB' : '#CBD5E1',
            }}
          >
            <span
              className={`inline-block w-[24px] h-[24px] transform bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                route.isNotificationOn ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`}
            />
            <span className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none text-white text-[10px]">
              {route.isNotificationOn ? (
                <Bell className="w-3 h-3 ml-0.5 text-white" />
              ) : (
                <BellOff className="w-3 h-3 mr-0.5 text-slate-500 opacity-0" />
              )}
            </span>
          </button>

          <ChevronRight className="w-5 h-5 text-[#64748B]" />
        </div>
      </div>
    </div>
  );
}
