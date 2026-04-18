import { ShiftType, ShiftConfig, Employee } from './types';

export const SHIFT_CONFIGS: Record<ShiftType, ShiftConfig> = {
  [ShiftType.PAGI]: {
    type: ShiftType.PAGI,
    label: 'Pagi',
    code: 'P',
    timeRange: {
      weekday: '09:30 - 19:00',
      weekend: '07:30 - 17:00'
    },
    colorFrom: 'from-blue-500',
    colorTo: 'to-blue-700',
    textColor: 'text-white',
    ringColor: 'ring-blue-300',
  },
  [ShiftType.MIDDLE]: {
    type: ShiftType.MIDDLE,
    label: 'Middle',
    code: 'M',
    timeRange: {
      weekday: '11:30 - 21:00',
      weekend: '11:30 - 21:00'
    },
    colorFrom: 'from-green-500',
    colorTo: 'to-green-700',
    textColor: 'text-white',
    ringColor: 'ring-green-300',
  },
  [ShiftType.LIBUR]: {
    type: ShiftType.LIBUR,
    label: 'Libur',
    code: 'O',
    timeRange: {
      weekday: 'OFF',
      weekend: 'OFF'
    },
    description: 'Istirahat Penuh',
    colorFrom: 'from-red-500',
    colorTo: 'to-red-800',
    textColor: 'text-white',
    ringColor: 'ring-red-300',
  },
};

export const INITIAL_WEEKLY_PATTERN: Record<string, ShiftType[]> = {
  // Default pattern for new employees: All OFF
  'default': Array(7).fill(ShiftType.LIBUR)
};

// Helper to generate dates for a specific month
export const generateMonthDates = (year: number, month: number) => { // month is 0-indexed (0 = Jan)
  const date = new Date(year, month, 1);
  const dates = [];
  
  // Indonesian Day Names
  const daysID = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

  while (date.getMonth() === month) {
    const yearStr = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    
    dates.push({
      dateStr: `${yearStr}-${monthStr}-${dayStr}`,
      dayName: daysID[date.getDay()],
      dayNum: String(date.getDate()),
    });
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

// Generate Shifts for the whole month for a given list of employees based on a pattern
export const generateShiftsFromPattern = (
  year: number, 
  month: number, 
  employeeList: Employee[],
  pattern: Record<string, ShiftType[]>
) => {
  const shifts: Record<string, Record<string, ShiftType>> = {};
  const dates = generateMonthDates(year, month);

  employeeList.forEach(emp => {
    shifts[emp.id] = {};
    const empPattern = pattern[emp.id] || pattern['default'] || Array(7).fill(ShiftType.LIBUR);
    dates.forEach((day) => {
      // Get the day of the week (0 for Sunday, 1 for Monday, etc.)
      const dayOfWeek = new Date(day.dateStr).getDay();
      shifts[emp.id][day.dateStr] = empPattern[dayOfWeek];
    });
  });
  return shifts;
};

// Colors for avatars
export const AVATAR_COLORS = [
  'bg-indigo-900', 'bg-emerald-800', 'bg-red-800', 'bg-blue-600', 'bg-amber-700',
  'bg-purple-800', 'bg-pink-700', 'bg-cyan-800', 'bg-orange-700', 'bg-slate-800'
];

export const getEmployeeInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};
