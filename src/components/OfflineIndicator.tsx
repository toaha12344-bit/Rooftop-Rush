import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-500/90 border border-amber-300 text-slate-950 px-3.5 py-1.5 shadow-2xl backdrop-blur-xs select-none animate-pulse">
      <WifiOff className="w-4 h-4 text-slate-950 stroke-[2.5]" />
      <span className="font-pixel text-[11px] font-bold tracking-wider">
        OFFLINE MODE — RUNNING FROM CACHE
      </span>
    </div>
  );
};
