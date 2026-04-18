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
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl shadow-sm p-2 flex-1 md:max-w-xs">
          <button title="Bulan Sebelumnya" aria-label="Bulan Sebelumnya"
            onClick={onPreviousMonth} 
            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-95"
          >
            <ChevronLeft size={20} className="stroke-[2.5px]" />
            <span className="sr-only">Bulan Sebelumnya</span>
          </button>
          <span className="text-slate-900 font-bold text-lg tracking-tight capitalize">{monthYearString}</span>
          <button title="Bulan Berikutnya" aria-label="Bulan Berikutnya"
            onClick={onNextMonth} 
            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-95"
          >
            <ChevronRight size={20} className="stroke-[2.5px]" />
            <span className="sr-only">Bulan Berikutnya</span>
          </button>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onExportPDF}
            variant="outline"
            className="h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex-1 md:flex-none"
          >
            <FileText size={18} className="mr-2" />
            PDF Bulanan
          </Button>
          <Button 
            onClick={onExportPatternPDF}
            className="h-12 px-6 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all flex-1 md:flex-none"
          >
            <CalendarDays size={18} className="mr-2" />
            PDF Pola
          </Button>
        </div>
      </div>

      {/* Legend & Mode Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <GlossyButton type={ShiftType.LIBUR} size="sm" />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Off</span>
          </div>
          <div className="flex items-center gap-2.5">
            <GlossyButton type={ShiftType.PAGI} size="sm" />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Pagi</span>
          </div>
          <div className="flex items-center gap-2.5">
            <GlossyButton type={ShiftType.MIDDLE} size="sm" />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Mid</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-1.5 px-3 rounded-full border border-slate-100/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Quick Edit Mode
        </div>
      </div>
    </div>
  );
};

export default SchedulerHeader;
