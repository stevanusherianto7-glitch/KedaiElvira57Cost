import React from 'react';
import { cn } from '@/lib/utils';
import { ShiftType } from '../../types';
import { SHIFT_CONFIGS } from '../../schedulerConstants';

interface GlossyButtonProps {
  type: ShiftType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  selected?: boolean;
}

const GlossyButton: React.FC<GlossyButtonProps> = ({ type, size = 'md', onClick, selected = false }) => {
  const config = SHIFT_CONFIGS[type];
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs font-bold',
    lg: 'w-12 h-12 text-sm font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const sphereColor = 
    type === ShiftType.PAGI ? 'sphere-blue' :
    type === ShiftType.MIDDLE ? 'sphere-green' :
    'sphere-red';

  return (
    <button
      onClick={onClick}
      className={cn(
        "sphere-base",
        sphereColor,
        sizeClasses[size],
        selected ? "ring-4 ring-white shadow-xl scale-110 z-10" : "shadow-md",
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
