export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendTransitNotification = (routeName: string, routeNo: string, remainingMinutes: number): void => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const title = `[출퇴근 길잡이] ${routeName}`;
    const body = `지금 출발하세요! ${routeNo} 도착까지 ${remainingMinutes}분 남았습니다.`;
    
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    } catch (error) {
      console.error('Failed to send browser notification:', error);
    }
  }
};
