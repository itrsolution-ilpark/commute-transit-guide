import { RefreshCw, Plus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showAdd?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => void;
  onAddClick?: () => void;
}

export default function Header({
  title = '출퇴근 길잡이',
  showBack = false,
  showAdd = false,
  showRefresh = false,
  onRefresh,
  onAddClick,
}: HeaderProps) {
  const navigate = useNavigate();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    if (isRotating) return;
    setIsRotating(true);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRotating(false);
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-50 h-[56px] bg-[#2563EB] text-white flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center space-x-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-[18px] font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center space-x-1">
        {showRefresh && (
          <button
            onClick={handleRefreshClick}
            aria-label="새로고침"
            className="flex items-center justify-center w-11 h-11 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 transition-transform duration-1000 ${
                isRotating ? 'rotate-[360deg]' : ''
              }`}
            />
          </button>
        )}
        {showAdd && (
          <button
            onClick={onAddClick || (() => navigate('/search'))}
            aria-label="경로 추가"
            className="flex items-center space-x-1 px-3 py-2 bg-white text-[#2563EB] font-semibold rounded-lg hover:bg-blue-50 transition-colors min-h-[44px]"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">경로 추가</span>
          </button>
        )}
      </div>
    </header>
  );
}
