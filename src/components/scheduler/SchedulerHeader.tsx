import React from 'react';
import { ChevronLeft, ChevronRight, FileText, CalendarDays } from 'lucide-react';
import GlossyButton from './GlossyButton';
import { ShiftType } from '../../types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SchedulerHeaderProps {
  onExportPDF?: () => void;
  onExportPatternPDF?: () => void;
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const SchedulerHeader: React.FC<SchedulerHeaderProps> = ({
  onExportPDF,
  onExportPatternPDF,
  currentDate,
  onPreviousMonth,
  onNextMonth,
}) => {
  const monthYearString = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Legend & Month Control Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Legend - Spheres */}
        <div className="flex items-center gap-6 py-4 px-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm w-fit">
          <div className="flex items-center gap-3">
            <GlossyButton type={ShiftType.PAGI} size="sm" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Pagi</span>
          </div>
          <div className="flex items-center gap-3">
            <GlossyButton type={ShiftType.MIDDLE} size="sm" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Mid</span>
          </div>
          <div className="flex items-center gap-3">
            <GlossyButton type={ShiftType.LIBUR} size="sm" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Libur</span>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white border border-slate-100 rounded-full shadow-sm p-1.5 flex-1 max-w-sm mx-auto lg:mx-0">
          <button 
            onClick={onPreviousMonth} 
            title="Bulan Sebelumnya"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-slate-900 font-black text-sm uppercase tracking-widest">{monthYearString}</span>
          <button 
            onClick={onNextMonth} 
            title="Bulan Berikutnya"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
           <button 
             onClick={onExportPDF}
             className="h-12 px-6 rounded-2xl font-bold bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm active:scale-95"
           >
             <FileText size={18} className="mr-2" />
             PDF
           </button>
           <button 
             onClick={onExportPatternPDF}
             className="h-12 px-6 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl shadow-slate-200 active:scale-95"
           >
             <CalendarDays size={18} className="mr-2" />
             Pola
           </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulerHeader;
