export type Unit = 'kg' | 'gr' | 'liter' | 'ml' | 'pcs' | 'buah' | 'karung' | 'dus' | 'pack' | 'botol' | 'sachet' | 'ikat' | 'kaleng' | 'galon' | 'box' | 'papan' | 'bks';

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
