import React from 'react';
import { Employee, ShiftType } from '../../types';
import GlossyButton from './GlossyButton';
import { cn } from '@/lib/utils';

interface ScheduleGridProps {
  employees: Employee[];
  shifts: Record<string, Record<string, ShiftType>>;
  dates: { dateStr: string; dayName: string; dayNum: string }[];
  onShiftClick: (employeeId: string, dateStr: string, currentType: ShiftType) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ employees, shifts, dates, onShiftClick }) => {
  return (
    <div className="relative z-0 space-y-8">
      <div className="bg-white min-h-[500px] flex flex-col rounded-[2.5rem] border border-slate-50 overflow-hidden shadow-sm">
        
        {/* Scrollable Container with 1px scrollbar utility */}
        <div className="overflow-x-auto overflow-y-auto flex-1 mini-scrollbar-x touch-pan-x touch-pan-y">
          <div className="min-w-max relative bg-white">
            
            {/* Table Header - Sticky */}
            <div className="flex bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
              {/* Sticky Name Header */}
              <div className="sticky left-0 bg-white z-50 w-32 p-4 flex items-end border-r border-slate-100">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">KARYAWAN</span>
              </div>
              
              {/* Date Headers */}
              {dates.map((day) => (
                <div key={day.dateStr} className="flex flex-col items-center justify-center w-[72px] py-4 px-1 border-r border-slate-50 last:border-r-0">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest mb-1",
                    day.dayName === 'MIN' || day.dayName === 'SAB' ? 'text-rose-500' : 'text-slate-400'
                  )}>
                    {day.dayName}
                  </span>
                  <span className={cn(
                    "text-base font-black tracking-tighter",
                    day.dayName === 'MIN' || day.dayName === 'SAB' ? 'text-rose-600' : 'text-slate-800'
                  )}>
                    {day.dayNum}
                  </span>
                </div>
              ))}
            </div>

            {/* Employee Rows */}
            <div className="divide-y divide-slate-50/50">
              {employees.map((emp) => (
                <div key={emp.id} className="flex group hover:bg-slate-50/50 transition-colors">
                  
                  {/* Sticky Employee Name */}
                  <div className="sticky left-0 bg-white group-hover:bg-slate-50/50 z-20 w-32 p-4 flex flex-col justify-center border-r border-slate-100 transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                    <span className="font-black text-slate-900 text-[11px] truncate leading-tight tracking-tight uppercase">{emp.name.toUpperCase()}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">{emp.role.toUpperCase()}</span>
                  </div>

                  {/* Shift Cells */}
                  {dates.map((day) => {
                    const shiftType = shifts[emp.id]?.[day.dateStr] || ShiftType.LIBUR;
                    return (
                      <div key={`${emp.id}-${day.dateStr}`} className="w-[72px] flex items-center justify-center p-3 border-r border-slate-50/50 last:border-r-0">
                        <GlossyButton 
                          type={shiftType} 
                          size="sm"
                          onClick={() => onShiftClick(emp.id, day.dateStr, shiftType)}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
        
        {/* Summary Footer */}
        <div className="border-t border-slate-100 bg-white p-4 text-center">
            <span className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">
                {employees.length} TIM AKTIF · {dates.length} HARI PENJADWALAN
            </span>
        </div>

      </div>
    </div>
  );
};

export default ScheduleGrid;
