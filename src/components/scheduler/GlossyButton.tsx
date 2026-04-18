import React from 'react';
import { cn } from '@/lib/utils';
import { ShiftType } from '../../types';
import { SHIFT_CONFIGS } from '../../schedulerConstants';

interface GlossyButtonProps {
  type: ShiftType | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  selected?: boolean;
}

const GlossyButton: React.FC<GlossyButtonProps> = ({ type, size = 'md', onClick, selected = false }) => {
  // Defensive normalization to prevent React crashes if data from DB is mismatched
  const normalizedType = (type || '').toString().toUpperCase();
  const validTypes = [ShiftType.PAGI, ShiftType.MIDDLE, ShiftType.LIBUR];
  const safeType = validTypes.includes(normalizedType as ShiftType) 
                    ? (normalizedType as ShiftType) 
                    : ShiftType.LIBUR;
  
  const config = SHIFT_CONFIGS[safeType];
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs font-bold',
    lg: 'w-12 h-12 text-sm font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const sphereColor = 
    safeType === ShiftType.PAGI ? 'sphere-blue' :
    safeType === ShiftType.MIDDLE ? 'sphere-green' :
    'sphere-red';

  if (!config) {
    return <div className={cn("rounded-full bg-slate-200 animate-pulse", sizeClasses[size])} />;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "sphere-base",
        sphereColor,
        sizeClasses[size],
        selected ? "ring-4 ring-white shadow-xl scale-110 z-10" : "shadow-md"
      )}
    >
      <div className="sphere-highlight" />
      <div className="sphere-shadow" />
      <span className="relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] font-black uppercase tracking-tighter">
        {config.code}
      </span>
    </button>
  );
};

export default GlossyButton;
