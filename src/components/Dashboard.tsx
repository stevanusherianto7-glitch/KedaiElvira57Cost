import * as React from "react";
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowRight,
  FileDown,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ingredient, Transaction, Expense, Recipe } from "../types";
import { formatCurrency } from "@/lib/utils";
import { Logo } from "./Logo";
import { SalesSync } from "./SalesSync";

interface DashboardProps {
  transactions: Transaction[];
  recipes: Recipe[];
  ingredients: Ingredient[];
  expenses: Expense[];
  pettyCash: number;
  handleBackup: () => void;
  handleRestore: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClosing: () => void;
  onTabChange: (tab: string) => void;
  onProcessTransaction: (transaction: Transaction) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  recipes,
  ingredients,
  expenses,
  pettyCash,
  handleRestore,
  handleClosing,
  onTabChange,
  onProcessTransaction
}) => {
  const [isSalesSyncOpen, setIsSalesSyncOpen] = React.useState(false);

  const totalSales = transactions.reduce((acc, t) => acc + t.totalPrice, 0);
  const totalHpp = transactions.reduce((acc, t) => acc + (t.totalHpp || 0), 0);
  const grossProfit = totalSales - totalHpp;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const lowStockCount = ingredients.filter(i => i.stockQuantity <= i.lowStockThreshold).length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo size={80} className="hidden sm:block" />
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">ERP Engine</h2>
            <p className="text-slate-500 font-medium text-sm">Stok Gudang Real-time</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsSalesSyncOpen(true)}
            className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-xl shadow-emerald-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Input Sales
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Card className="premium-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <TrendingUp className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">Live</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Penjualan</p>
            <h3 className="text-xl font-bold text-slate-900">{formatCurrency(totalSales)}</h3>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <TrendingUp className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-widest">Gross</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Laba Kotor</p>
            <h3 className="text-xl font-bold text-blue-600">{formatCurrency(grossProfit)}</h3>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                <AlertTriangle className="w-5 h-5 text-rose-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full uppercase tracking-widest">Alert</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stok Menipis</p>
            <h3 className="text-xl font-bold text-slate-900">{lowStockCount} Item</h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        {/* Quick Actions & Low Stock */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Stok Gudang</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockCount === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Semua Stok Aman!</h4>
                  <p className="text-emerald-600/70 text-[10px] font-bold leading-tight mt-1">Belum ada bahan baku yang menyentuh batas minimum stok.</p>
                </div>
              </div>
            ) : (
              ingredients.filter(i => i.stockQuantity <= i.lowStockThreshold).map(ing => (
                <Card key={ing.id} className="premium-card">
                  <div className="p-6 flex flex-col justify-between h-full gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">{ing.name}</h3>
                      <p className="text-sm text-rose-500 font-bold">Sisa: {ing.stockQuantity} {ing.useUnit}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safety Stock</p>
                        <p className="text-sm font-bold text-slate-900">{ing.lowStockThreshold} {ing.useUnit}</p>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          ref={(el) => {
                            if (el) {
                              const width = Math.min(100, (ing.stockQuantity / (ing.lowStockThreshold || 1)) * 100);
                              el.style.setProperty('width', `${width}%`);
                            }
                          }}
                          className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <SalesSync 
        isOpen={isSalesSyncOpen}
        onClose={() => setIsSalesSyncOpen(false)}
        recipes={recipes}
        ingredients={ingredients}
        onProcessTransaction={onProcessTransaction}
      />
    </div>
  );
};
