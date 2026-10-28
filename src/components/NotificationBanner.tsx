import React, { useEffect, useState } from 'react';
import { Bell, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NotificationBanner() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      new Notification('출퇴근 길잡이', {
        body: '출발 타이밍 알림이 성공적으로 설정되었습니다!',
      });
    }
  };

  if (permission === 'granted') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 flex items-center justify-between text-sm text-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">브라우저 푸시 알림 활성화됨</p>
            <p className="text-xs text-emerald-600">출발 시간에 맞춰 알림을 전송해 드립니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-center justify-between text-sm text-red-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">알림 권한이 차단되었습니다</p>
            <p className="text-xs text-red-600">브라우저 설정에서 알림 권한을 허용해 주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-blue-900">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold">출발 타이밍 알림을 받아보세요</p>
          <p className="text-xs text-blue-700">집에서 나갈 시간에 맞춰 브라우저 알림을 보내드립니다.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={requestPermission}
        className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl text-xs shadow-sm transition-all active:scale-95"
        style={{ minHeight: '38px' }}
      >
        알림 권한 허용하기
      </button>
    </div>
  );
}
