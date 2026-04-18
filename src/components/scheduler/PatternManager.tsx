import React, { useState } from 'react';
import { ArrowLeft, Save, Layers, Info } from 'lucide-react';
import { Employee, ShiftType } from '../../types';
import GlossyButton from './GlossyButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatternManagerProps {
  employees: Employee[];
  initialPattern: Record<string, ShiftType[]>;
  onSavePattern: (pattern: Record<string, ShiftType[]>) => void;
  onApplyPattern: (pattern: Record<string, ShiftType[]>) => void;
  onBack: () => void;
  currentDate: Date;
}

const SHIFT_CYCLE: ShiftType[] = [ShiftType.PAGI, ShiftType.MIDDLE, ShiftType.LIBUR];

// New display order: Monday -> Sunday
const DISPLAY_DAYS_ORDER = [
    { name: 'SEN', index: 1 }, // Monday, index 1 in getDay()
    { name: 'SEL', index: 2 }, // Tuesday
    { name: 'RAB', index: 3 }, // Wednesday
    { name: 'KAM', index: 4 }, // Thursday
    { name: 'JUM', index: 5 }, // Friday
    { name: 'SAB', index: 6 }, // Saturday
    { name: 'MIN', index: 0 }, // Sunday, index 0 in getDay()
];

const PatternManager: React.FC<PatternManagerProps> = ({ employees, initialPattern, onSavePattern, onApplyPattern, onBack }) => {
  const [pattern, setPattern] = useState(initialPattern);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const handleShiftChange = (empId: string, dayIndex: number) => {
    const currentShift = pattern[empId]?.[dayIndex] || ShiftType.LIBUR;
    const currentIndex = SHIFT_CYCLE.indexOf(currentShift);
    const nextIndex = (currentIndex + 1) % SHIFT_CYCLE.length;
    const nextShift = SHIFT_CYCLE[nextIndex];

    setPattern(prev => ({
      ...prev,
      [empId]: [
        ...(prev[empId] || Array(7).fill(ShiftType.LIBUR))
      ].map((s, i) => i === dayIndex ? nextShift : s)
    }));
  };

  const handleSave = () => {
    onSavePattern(pattern);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleApply = () => {
    const confirmation = window.confirm(
      "Apakah Anda yakin? Ini akan menimpa seluruh jadwal di bulan ini dengan pola yang baru. Perubahan manual akan hilang."
    );
    if (confirmation) {
      onSavePattern(pattern); // Save before applying
      onApplyPattern(pattern);
      setApplySuccess(true);
      setTimeout(() => {
        onBack();
      }, 1500); // Delay navigation to show feedback
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
      {/* Header - Centered as per Image 2/3 */}
      <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            title="Kembali"
            className="w-10 h-10 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 text-center pr-10">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pola Jadwal Mingguan</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Master Penjadwalan Rutin</p>
          </div>
      </div>

      {/* Info Box */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-[2rem] flex gap-4">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1 leading-tight tracking-tight">Optimasi Penjadwalan</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">Atur pola dasar 7 hari kerja. Pola ini akan <strong>digandakan secara otomatis</strong> ke seluruh minggu dalam bulan ini.</p>
          </div>
      </div>

      {/* Pattern Grid */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
         <div className="overflow-x-auto scheduler-scrollbar">
          <div className="min-w-max">
              {/* Header */}
              <div className="flex bg-slate-50/50 border-b border-slate-100">
                  <div className="sticky left-0 bg-white/95 backdrop-blur-sm w-32 p-4 text-[10px] font-bold text-slate-400 border-r border-slate-100 z-30 uppercase tracking-widest flex items-end">Karyawan</div>
                  {DISPLAY_DAYS_ORDER.map((day) => (
                      <div key={day.index} className={cn(
                          "flex items-center justify-center w-[72px] py-4 border-r border-slate-100 last:border-r-0",
                          (day.name === 'MIN' || day.name === 'SAB') ? 'bg-rose-50/30' : ''
                      )}>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            day.name === 'MIN' || day.name === 'SAB' ? 'text-rose-500' : 'text-slate-500'
                        )}>
                          {day.name}
                        </span>
                      </div>
                  ))}
              </div>
              {/* Body */}
              <div className="divide-y divide-slate-50">
                  {employees.map(emp => (
                      <div key={emp.id} className="flex group hover:bg-slate-50/30 transition-colors">
                          <div className="sticky left-0 bg-white group-hover:bg-slate-50/30 w-32 p-4 border-r border-slate-100 z-20 transition-colors">
                              <p className="font-bold text-sm text-slate-900 truncate tracking-tight">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest truncate mt-0.5">{emp.role}</p>
                          </div>
                          {DISPLAY_DAYS_ORDER.map((day) => (
                              <div key={day.index} className="w-[72px] flex items-center justify-center p-3 border-r border-slate-100/50 last:border-r-0">
                                  <GlossyButton
                                      type={pattern[emp.id]?.[day.index] || ShiftType.LIBUR}
                                      size="sm"
                                      onClick={() => handleShiftChange(emp.id, day.index)}
                                  />
                              </div>
                          ))}
                      </div>
                  ))}
              </div>
          </div>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={handleSave}
            disabled={saveSuccess || applySuccess}
            className={cn(
              "flex-1 h-14 rounded-2xl font-bold shadow-xl transition-all",
              saveSuccess 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50 border"
            )}
          >
            <Save size={20} className="mr-2" />
            {saveSuccess ? 'Pola Tersimpan' : 'Simpan Pola'}
          </Button>
           <Button
            onClick={handleApply}
            disabled={saveSuccess || applySuccess}
            className={cn(
                "flex-1 h-14 rounded-2xl font-bold shadow-xl transition-all",
                applySuccess
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
            )}
          >
            <Layers size={20} className="mr-2" />
            {applySuccess ? 'Berhasil Diterapkan' : 'Terapkan ke Bulan Ini'}
          </Button>
      </div>
    </div>
  );
};

export default PatternManager;
