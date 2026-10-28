import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bell, BellOff, Edit3, Save, Trash2, ArrowLeft } from 'lucide-react';
import { Route, TransitArrivalInfo } from '../types';
import { getRouteById, updateRoute, deleteRoute } from '../services/storage';
import { fetchArrivalInfo } from '../services/transitApi';
import { requestNotificationPermission, sendTransitNotification } from '../services/notification';
import Timeline from '../components/Timeline';
import Toast from '../components/Toast';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [route, setRoute] = useState<Route | null>(null);
  const [arrivalInfo, setArrivalInfo] = useState<TransitArrivalInfo | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const [nameInput, setNameInput] = useState<string>('');
  const [departureTimeInput, setDepartureTimeInput] = useState<string>('');
  const [arrivalTimeInput, setArrivalTimeInput] = useState<string>('');
  const [walkTimeInput, setWalkTimeInput] = useState<number>(7);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('success');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [hasNotified, setHasNotified] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      const found = getRouteById(id);
      if (found) {
        setRoute(found);
        setNameInput(found.name);
        setDepartureTimeInput(found.departureTime || '08:10');
        setArrivalTimeInput(found.arrivalTime || '08:55');
        setWalkTimeInput(found.walkTimeMinutes);
      }
    }
  }, [id]);

  const loadArrival = async () => {
    if (!route) return;
    try {
      const data = await fetchArrivalInfo(route.id, route.walkTimeMinutes);
      setArrivalInfo(data);

      if (
        route.isNotificationOn &&
        !hasNotified &&
        data.remainingMinutes <= route.walkTimeMinutes
      ) {
        sendTransitNotification(route.name, data.remainingMinutes);
        setHasNotified(true);
      }
    } catch (error) {
      console.error('Failed to fetch arrival info:', error);
      setToastMessage('실시간 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요');
      setToastType('error');
    }
  };

  useEffect(() => {
    if (route) {
      loadArrival();
    }
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [route?.id, route?.walkTimeMinutes, refreshTrigger]);

  if (!route) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <header className="sticky top-0 z-50 h-[56px] bg-[#2563EB] text-white flex items-center px-4 shadow-md">
          <button
            onClick={() => navigate('/')}
            aria-label="뒤로가기"
            className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-blue-700 transition-colors mr-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[18px] font-bold tracking-tight">경로 상세</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <p className="text-sm text-[#64748B] mb-4">해당 경로를 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-xl font-bold min-h-[44px]"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    loadArrival();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSaveEdit = () => {
    const updated = updateRoute(route.id, {
      name: nameInput.trim() || route.name,
      departureTime: departureTimeInput.trim() || route.departureTime,
      arrivalTime: arrivalTimeInput.trim() || route.arrivalTime,
      walkTimeMinutes: Number(walkTimeInput),
    });

    if (updated) {
      setRoute(updated);
      setIsEditing(false);
      setToastMessage('경로 정보가 수정되었습니다.');
      setToastType('success');
    } else {
      setToastMessage('수정에 실패했습니다.');
      setToastType('error');
    }
  };

  const handleToggleNotification = async () => {
    const nextStatus = !route.isNotificationOn;
    if (nextStatus) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setToastMessage('브라우저 알림 권한이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.');
        setToastType('error');
        return;
      }
    }

    const updated = updateRoute(route.id, { isNotificationOn: nextStatus });
    if (updated) {
      setRoute(updated);
      setToastMessage(nextStatus ? '알림이 켜졌습니다.' : '알림이 꺼졌습니다.');
      setToastType('success');
    }
  };

  const handleDeleteConfirm = () => {
    const success = deleteRoute(route.id);
    if (success) {
      navigate('/');
    } else {
      setToastMessage('삭제에 실패했습니다.');
      setToastType('error');
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 flex flex-col">
      <header className="sticky top-0 z-50 h-[56px] bg-[#2563EB] text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[18px] font-bold tracking-tight">{route.name} 상세</h1>
        </div>

        <div>
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="flex items-center space-x-1 px-3 py-2 bg-white text-[#2563EB] font-semibold rounded-lg hover:bg-blue-50 transition-colors min-h-[44px]"
            >
              <Save className="w-5 h-5" />
              <span className="text-sm">저장</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1 px-3 py-2 bg-white text-[#2563EB] font-semibold rounded-lg hover:bg-blue-50 transition-colors min-h-[44px]"
            >
              <Edit3 className="w-5 h-5" />
              <span className="text-sm">수정</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* 수정 모드 폼 */}
        {isEditing && (
          <div className="bg-white border border-[#2563EB] rounded-[12px] p-4 shadow-md space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-[#2563EB]">경로 정보 편집</h3>
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1">경로명</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">출발 시각</label>
                <input
                  type="text"
                  value={departureTimeInput}
                  onChange={(e) => setDepartureTimeInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">도착 시각</label>
                <input
                  type="text"
                  value={arrivalTimeInput}
                  onChange={(e) => setArrivalTimeInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg text-sm text-[#0F172A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#64748B] mb-1">
                도보 이동 소요 시간 ({walkTimeInput}분)
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={walkTimeInput}
                onChange={(e) => setWalkTimeInput(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
            </div>
          </div>
        )}

        {/* 실시간 요약 카드 */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-[#0F172A]">
              출발: {route.departureTime} ➔ 도착: {route.arrivalTime}
            </div>

            <button
              onClick={handleToggleNotification}
              aria-label={route.isNotificationOn ? '알림 끄기' : '알림 켜기'}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors min-h-[44px]"
              style={{
                backgroundColor: route.isNotificationOn ? '#EFF6FF' : '#F1F5F9',
                color: route.isNotificationOn ? '#2563EB' : '#64748B',
                borderColor: route.isNotificationOn ? '#2563EB' : '#CBD5E1',
              }}
            >
              {route.isNotificationOn ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span>{route.isNotificationOn ? '알림 켜짐' : '알림 꺼짐'}</span>
            </button>
          </div>

          <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#64748B] mb-1">실시간 도착 남은 시간</div>
              {arrivalInfo ? (
                <div className="text-[24px] font-extrabold text-[#10B981] leading-tight">
                  {arrivalInfo.remainingMinutes}분 {arrivalInfo.remainingSeconds}초 후
                </div>
              ) : (
                <div className="text-base font-bold text-[#64748B]">조회 중...</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-[#64748B] mb-1">남은 정거장</div>
              <div className="text-base font-bold text-[#0F172A]">
                {arrivalInfo ? `${arrivalInfo.remainingStations}정거장 전` : '-'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
            <span>도보 소요 시간: <strong className="text-[#0F172A]">{route.walkTimeMinutes}분</strong></span>
            <button
              onClick={handleRefresh}
              className="text-[#2563EB] font-bold hover:underline min-h-[44px] flex items-center"
            >
              즉시 새로고침
            </button>
          </div>
        </div>

        {/* 상세 경로 구간 리스트 (타임라인) */}
        <Timeline route={route} arrivalInfo={arrivalInfo} />

        {/* 하단 [경로 삭제] 버튼 */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-1 text-sm font-bold text-[#EF4444] hover:underline min-h-[44px] px-4"
          >
            <Trash2 className="w-4 h-4" />
            <span>경로 삭제</span>
          </button>
        </div>
      </main>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A]">경로 삭제</h3>
            <p className="text-sm text-[#64748B]">정말 이 경로를 삭제하시겠습니까?</p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-gray-100 text-[#64748B] font-bold rounded-xl hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-[#EF4444] text-white font-bold rounded-xl hover:bg-red-600 transition-colors min-h-[44px]"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
          onRetry={toastType === 'error' ? handleRefresh : undefined}
        />
      )}
    </div>
  );
}
