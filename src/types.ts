export type Unit = 'kg' | 'gr' | 'liter' | 'ml' | 'pcs' | 'buah' | 'karung' | 'dus' | 'pack' | 'botol' | 'sachet' | 'ikat' | 'kaleng' | 'galon' | 'box' | 'papan' | 'bks';

export enum ShiftType {
  PAGI = 'PAGI',
  MIDDLE = 'MIDDLE',
  LIBUR = 'LIBUR'
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  purchaseUnit: Unit;
  useUnit: Unit;
  conversionValue: number; // e.g., 1000 if 1kg = 1000gr
  stockQuantity: number;
  lowStockThreshold: number;
}

export interface RecipeItem {
  id: string;
  ingredientId: string;
  quantityNeeded: number; // in useUnit
}

export interface Recipe {
  id: string;
  name: string;
  category: 'Makanan' | 'Minuman';
  sellingPrice: number;
  roundedSellingPrice?: number;
  markupPercent: number;
  laborCost: number;
  overheadCost: number;
  shrinkagePercent: number;
  items: RecipeItem[];
  status?: string;
  lastUpdated?: string;
  laborType?: 'manual' | 'master';
  overheadBreakdown?: {
    electricity: number;
    gas: number;
    gasDailyUsage?: number;
    gasPricePerCylinder?: number;
    water: number;
    marketing: number;
    internet: number;
    trashFee?: number;
    wastePercent: number;
    labor: number;
    employeeCount: number;
    salaryPerEmployee: number;
    targetPortions: number;
  };
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
  avatarColor?: string;
  initials?: string;
}

export interface ShiftConfig {
  type: ShiftType;
  label: string;
  code: string; // 'P', 'M', 'O'
  timeRange: {
    weekday: string;
    weekend: string;
  };
  description?: string;
  colorFrom: string;
  colorTo: string;
  textColor: string;
  ringColor: string;
}

export type EmployeeSchedule = Record<string, ShiftType>;

export interface EditModalState {
  isOpen: boolean;
  employeeId: string | null;
  dateStr: string | null; // YYYY-MM-DD
  currentType: ShiftType | null;
}

export interface TransactionItem {
  recipeId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: TransactionItem[];
  totalPrice: number;
  totalHpp: number;
  paymentMethod: 'Tunai' | 'QRIS';
  cashReceived?: number;
  change?: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Operasional' | 'Bahan Baku' | 'Lainnya';
}

export interface PettyCash {
  balance: number;
  lastUpdated: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}
