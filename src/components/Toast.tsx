import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  onRetry?: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'error',
  onClose,
  onRetry,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor =
    type === 'error'
      ? 'bg-red-50 border-[#EF4444] text-[#EF4444]'
      : type === 'success'
      ? 'bg-emerald-50 border-[#10B981] text-[#10B981]'
      : 'bg-blue-50 border-[#2563EB] text-[#2563EB]';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between min-w-[320px] max-w-[90vw] p-4 bg-white border rounded-xl shadow-lg ${bgColor} animate-bounce-short`}
    >
      <div className="flex items-center space-x-3">
        {type === 'error' ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#EF4444]" />
        ) : (
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#10B981]" />
        )}
        <span className="text-sm font-medium text-[#0F172A]">{message}</span>
      </div>

      <div className="flex items-center space-x-2 ml-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-[#2563EB] text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors min-h-[32px]"
          >
            재시도
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
