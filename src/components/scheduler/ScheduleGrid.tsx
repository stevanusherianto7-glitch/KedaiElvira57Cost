import React from 'react';
import { Employee, ShiftType } from '../../types';
import GlossyButton from './GlossyButton';

interface ScheduleGridProps {
  employees: Employee[];
  shifts: Record<string, Record<string, ShiftType>>;
  dates: { dateStr: string; dayName: string; dayNum: string }[];
  onShiftClick: (employeeId: string, dateStr: string, currentType: ShiftType) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ employees, shifts, dates, onShiftClick }) => {
  return (
    <div className="relative z-0">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px] flex flex-col overflow-hidden">
        
        {/* Scrollable Container for both X and Y axis */}
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar touch-pan-x touch-pan-y">
          <div className="min-w-max relative">
            
            {/* Table Header - Now sticky */}
            <div className="flex border-b border-slate-100 bg-white sticky top-0 z-40">
              {/* Sticky Name Header */}
              <div className="sticky left-0 bg-white z-50 w-32 p-4 flex items-end border-r border-slate-100 shadow-[2px_0_10px_-2px_rgba(0,0,0,0.02)]">
                <span className="text-slate-900 font-bold text-xs uppercase tracking-widest">Karyawan</span>
              </div>
              
              {/* Date Headers */}
              {dates.map((day) => (
                <div key={day.dateStr} className="flex flex-col items-center justify-center w-[72px] py-4 px-1 border-r border-slate-50 last:border-r-0">
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                    day.dayName === 'MIN' || day.dayName === 'SAB' ? 'text-rose-500' : 'text-slate-400'
                  }`}>
                    {day.dayName}
                  </span>
                  <span className={`text-base font-bold ${
                     day.dayName === 'MIN' || day.dayName === 'SAB' ? 'text-rose-900' : 'text-slate-800'
                  }`}>
                    {day.dayNum}
                  </span>
                </div>
              ))}
            </div>

            {/* Employee Rows */}
            <div className="divide-y divide-slate-50">
              {employees.map((emp) => (
                <div key={emp.id} className="flex hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Sticky Employee Name */}
                  <div className="sticky left-0 bg-white group-hover:bg-slate-50/50 z-20 w-32 p-4 flex flex-col justify-center border-r border-slate-100 shadow-[2px_0_10px_-2px_rgba(0,0,0,0.02)] transition-colors">
                    <span className="font-bold text-slate-900 text-sm truncate leading-tight">{emp.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">{emp.role}</span>
                  </div>

                  {/* Shift Cells */}
                  {dates.map((day) => {
                    const shiftType = shifts[emp.id]?.[day.dateStr] || ShiftType.LIBUR;
                    return (
                      <div key={`${emp.id}-${day.dateStr}`} className="w-[72px] flex items-center justify-center p-3 border-r border-slate-50/50 last:border-r-0">
                        <GlossyButton 
                          type={shiftType} 
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
        <div className="border-t border-slate-100 bg-slate-50/30 p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                {employees.length} KARYAWAN | {dates.length} HARI PENJADWALAN
            </span>
        </div>

      </div>
    </div>
  );
};

export default ScheduleGrid;
