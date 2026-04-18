import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Calendar, CalendarDays } from 'lucide-react';
import { ShiftType, Employee } from '../../types';
import { SHIFT_CONFIGS } from '../../schedulerConstants';
import GlossyButton from './GlossyButton';
import { cn } from '@/lib/utils';

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  dateStr: string;
  initialType: ShiftType;
  onSave: (newType: ShiftType) => void;
}

const ShiftOption: React.FC<{
  type: ShiftType;
  isSelected: boolean;
  timeRange: string;
  onClick: () => void;
}> = ({ type, isSelected, timeRange, onClick }) => {
  const config = SHIFT_CONFIGS[type];
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group flex flex-col items-center justify-start text-center p-4 rounded-[1.5rem] border transition-all duration-200 cursor-pointer h-full",
        isSelected
          ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-200"
          : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30"
      )}
    >
      <div className="mb-3">
        <GlossyButton type={type} size="md" selected={isSelected} />
      </div>
      <span className={cn(
        "font-bold text-sm leading-tight",
        isSelected ? "text-white" : "text-slate-900"
      )}>
        {config.label}
      </span>
      <span className={cn(
        "text-[10px] mt-1 font-bold tracking-widest uppercase",
        isSelected ? "text-emerald-400" : "text-slate-400"
      )}>
        {timeRange}
      </span>
    </div>
  );
};


const EditShiftModal: React.FC<EditShiftModalProps> = ({ 
  isOpen, onClose, employee, dateStr, initialType, onSave 
}) => {
  const [selectedType, setSelectedType] = useState<ShiftType>(initialType);

  const { isWeekend, formattedDate, dayCategory } = useMemo(() => {
    const dateObj = new Date(dateStr);
    const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6;
    const formatted = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    return {
      isWeekend,
      formattedDate: formatted,
      dayCategory: isWeekend ? 'Sabtu - Minggu' : 'Senin - Jumat'
    };
  }, [dateStr]);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Atur Shift <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </h2>
            <div className="flex flex-col mt-1">
                <span className="text-slate-500 font-bold text-sm">{employee.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{employee.role}</span>
            </div>
          </div>
          <button title="Tutup" aria-label="Tutup"
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100"
          >
            <X size={20} />
            <span className="sr-only">Tutup</span>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Date Display */}
          <div className="flex items-center gap-4 bg-slate-50/50 border border-slate-100 rounded-2xl p-5">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
              <Calendar size={20} />
            </div>
            <span className="text-slate-900 font-bold text-lg capitalize">{formattedDate}</span>
          </div>

          {/* Shift Types Selector */}
          <div>
            <div className="flex items-center gap-2 mb-4">
               <CalendarDays size={14} className={isWeekend ? 'text-rose-500' : 'text-slate-400'} />
               <p className={cn(
                   "text-[10px] font-bold uppercase tracking-[0.2em]",
                   isWeekend ? "text-rose-500" : "text-slate-400"
               )}>{dayCategory}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[ShiftType.LIBUR, ShiftType.PAGI, ShiftType.MIDDLE].map((type) => {
                 const config = SHIFT_CONFIGS[type];
                 const timeRange = isWeekend ? config.timeRange.weekend : config.timeRange.weekday;
                 return (
                   <ShiftOption
                    key={type}
                    type={type}
                    isSelected={selectedType === type}
                    timeRange={timeRange}
                    onClick={() => setSelectedType(type)}
                   />
                 );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => {
              onSave(selectedType);
              onClose();
            }}
            className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <Save size={20} className="stroke-[2.5px]" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditShiftModal;
