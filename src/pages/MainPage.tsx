import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bus, BellOff } from 'lucide-react';
import { Route } from '../types';
import { getRoutes, deleteRoute, updateRoute } from '../services/storage';
import { requestNotificationPermission } from '../services/notification';
import Header from '../components/Header';
import RouteCard from '../components/RouteCard';
import Toast from '../components/Toast';

export default function MainPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success' | 'info'>('success');
  const [notificationBanner, setNotificationBanner] = useState<boolean>(false);

  const loadRouteList = () => {
    const data = getRoutes();
    setRoutes(data);
  };

  useEffect(() => {
    loadRouteList();

    // 알림 권한 상태 확인
    if ('Notification' in window && Notification.permission === 'denied') {
      setNotificationBanner(true);
    }

    // 30초 폴링 (자동 갱신)
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    loadRouteList();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      const success = deleteRoute(deleteTargetId);
      if (success) {
        setRoutes((prev) => prev.filter((r) => r.id !== deleteTargetId));
        setToastMessage('경로가 성공적으로 삭제되었습니다.');
        setToastType('success');
      } else {
        setToastMessage('경로 삭제에 실패했습니다.');
        setToastType('error');
      }
      setDeleteTargetId(null);
    }
  };

  const handleToggleNotification = async (id: string, currentStatus: boolean) => {
    if (!currentStatus) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setToastMessage('브라우저 알림 권한이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.');
        setToastType('error');
        setNotificationBanner(true);
        return;
      }
    }

    const updated = updateRoute(id, { isNotificationOn: !currentStatus });
    if (updated) {
      setRoutes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/route/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 flex flex-col">
      <Header
        title="출퇴근 길잡이"
        showRefresh={true}
        showAdd={true}
        onRefresh={handleRefresh}
        onAddClick={() => navigate('/search')}
      />

      {/* 알림 권한 차단 안내 배너 */}
      {notificationBanner && (
        <div role="region" aria-label="알림 권한 안내" className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-[#EF4444]">
            <BellOff className="w-5 h-5 flex-shrink-0" />
            <span>브라우저 알림 권한이 차단되어 있습니다. 브라우저 설정에서 허용해주세요.</span>
          </div>
          <button
            onClick={() => setNotificationBanner(false)}
            className="text-xs text-[#64748B] hover:text-[#0F172A] px-2 py-1 min-h-[32px]"
          >
            닫기
          </button>
        </div>
      )}

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {routes.length === 0 ? (
          /* 등록된 경로 없을 때 빈 상태 화면 */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mb-4">
              <Bus className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">등록된 출퇴근 경로가 없습니다</h2>
            <p className="text-sm text-[#64748B] mb-6">자주 이용하는 출퇴근 경로를 등록하고 실시간 도착 정보를 확인하세요.</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-[#2563EB] text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              첫 경로 등록하기
            </button>
          </div>
        ) : (
          /* 경로 카드 목록 */
          <div className="space-y-4">
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onDelete={handleDeleteClick}
                onToggleNotification={handleToggleNotification}
                onCardClick={handleCardClick}
                refreshTrigger={refreshTrigger}
              />
            ))}
          </div>
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A]">경로 삭제</h3>
            <p className="text-sm text-[#64748B]">정말 이 경로를 삭제하시겠습니까?</p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-3 bg-gray-100 text-[#64748B] font-bold rounded-xl hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
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
