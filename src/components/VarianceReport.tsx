import * as React from "react";
import { 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle2, 
  MinusCircle,
  TrendingDown,
  Info
} from "lucide-react";
import { Ingredient } from "../types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VarianceReportProps {
  ingredients: Ingredient[];
}

export const VarianceReport: React.FC<VarianceReportProps> = ({ ingredients }) => {
  const [physicalStock, setPhysicalStock] = React.useState<Record<string, number>>({});

  const handleUpdatePhysical = (id: string, value: number) => {
    setPhysicalStock(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-blue-900">Stock Opname & Variance</h3>
          <p className="text-blue-700/70 text-sm font-medium">Bandingkan stok sistem (teoretis) dengan stok fisik di gudang untuk melacak kehilangan bahan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingredients.map(ing => {
          const theoretical = ing.stockQuantity / (ing.conversionValue || 1);
          const physical = physicalStock[ing.id] !== undefined ? physicalStock[ing.id] : theoretical;
          const variance = theoretical - physical;
          const lossValue = variance * ing.purchasePrice;

          return (
            <Card key={ing.id} className="premium-card overflow-hidden">
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">{ing.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ing.category}</p>
                  </div>
                  {variance === 0 ? (
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest">Match</Badge>
                  ) : variance > 0 ? (
                    <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] uppercase tracking-widest">Loss</Badge>
                  ) : (
                    <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest">Surplus</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sistem</p>
                    <p className="text-sm font-bold text-slate-900">{theoretical.toFixed(2)} {ing.purchaseUnit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fisik</p>
                    <div className="relative">
                      <Input 
                        type="number"
                        value={physicalStock[ing.id] ?? ""}
                        placeholder={theoretical.toFixed(2)}
                        onChange={(e) => handleUpdatePhysical(ing.id, Number(e.target.value))}
                        className="h-8 py-0 px-2 rounded-lg border-slate-100 bg-slate-50 text-xs font-bold focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "p-3 rounded-xl border flex items-center justify-between",
                  variance === 0 ? "bg-slate-50 border-slate-100" : 
                  variance > 0 ? "bg-rose-50 border-rose-100" : "bg-blue-50 border-blue-100"
                )}>
                  <div className="flex items-center gap-2">
                    {variance === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : variance > 0 ? (
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                    )}
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      variance === 0 ? "text-slate-400" : variance > 0 ? "text-rose-600" : "text-blue-600"
                    )}>
                      Selisih: {Math.abs(variance).toFixed(2)} {ing.purchaseUnit}
                    </span>
                  </div>
                  {variance > 0 && (
                    <Tooltip>
                      <TooltipTrigger render={
                        <p className="text-[10px] font-black text-rose-700">-{formatCurrency(lossValue)}</p>
                      } />
                      <TooltipContent>
                        <p className="text-[10px] font-bold">Potensi Kerugian Berdasarkan Harga Beli</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
