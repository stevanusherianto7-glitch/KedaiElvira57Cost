import * as React from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { BahanManager } from "./components/BahanManager";
import { RecipeManager } from "./components/RecipeManager";
import { JobdeskManager } from "./components/JobdeskManager";
import { HistoryManager } from "./components/HistoryManager";
import { PettyCashManager } from "./components/PettyCashManager";
import { useAppState } from "./hooks/useAppState";
import { Ingredient, Recipe, Employee, Transaction, Expense } from "./types";
import { CATEGORIES, JOBDESK_MARKDOWN } from "./constants";
import { formatCurrency, cn } from "@/lib/utils";
import * as pdfService from "./services/pdfService";
import { TooltipProvider } from "@/components/ui/tooltip";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("ErrorBoundary caught an error", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-slate-900">Ups! Terjadi kesalahan.</h1>
            <p className="text-slate-500">Silakan muat ulang halaman atau hubungi pengembang.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// v1.0.3 - Absolute Path Fix
export default function App() {
  React.useEffect(() => {
    window.onerror = (msg, url, line, col, error) => {
      console.error("Global Error (Caught by App):", { msg, url, line, col, error });
      return false;
    };
    window.onunhandledrejection = (event) => {
      console.error("Unhandled Rejection (Caught by App):", event.reason);
    };
  }, []);

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = React.useState("home");
  const [transaksiTab, setTransaksiTab] = React.useState<'petty' | 'riwayat'>('petty');
  const [karyawanTab, setKaryawanTab] = React.useState<'data' | 'jobdesk' | 'slip'>('data');
  
  const state = useAppState();
  const {
    user,
    ingredients,
    setIngredients,
    recipes,
    setRecipes,
    employees,
    setEmployees,
    transactions,
    setTransactions,
    expenses,
    setExpenses,
    pettyCash,
    setPettyCash,
    isLoaded,
    deleteIngredient,
    deleteEmployee,
    handleBackup,
    handleRestore,
    handleAddIngredient,
    handleAddExpense,
    handleSaveEmployee,
    shifts,
    setShifts,
    weeklyPattern,
    setWeeklyPattern
  } = state;

  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = React.useState(false);
  const [newRecipe, setNewRecipe] = React.useState<Partial<Recipe>>({
    name: "",
    sellingPrice: 0,
    items: []
  });

  const [isAddingExpense, setIsAddingExpense] = React.useState(false);
  const [newExpense, setNewExpense] = React.useState<Partial<Expense>>({
    description: "",
    amount: 0,
    category: 'Operasional'
  });

  const [isAddingEmployee, setIsAddingEmployee] = React.useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = React.useState<string | null>(null);
  const [newEmployee, setNewEmployee] = React.useState<Partial<Employee>>({
    name: "",
    role: "",
    salary: 0
  });

  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([]);
  const [reportTitle, setReportTitle] = React.useState("STANDAR OPERASIONAL PROSEDUR (SOP)");
  const [selectedEmployeeForSlip, setSelectedEmployeeForSlip] = React.useState<Employee | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  const toggleTask = (task: string) => {
    setSelectedTasks(prev => 
      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
    );
  };

  const generateFilteredMarkdown = () => {
    if (selectedTasks.length === 0) return JOBDESK_MARKDOWN;
    
    let filtered = JOBDESK_MARKDOWN;
    const allTasks = JOBDESK_MARKDOWN.split('\n')
      .filter(line => line.includes('* [ ]'))
      .map(line => line.replace('* [ ]', '').trim());
    
    allTasks.forEach(task => {
      if (!selectedTasks.includes(task)) {
        filtered = filtered.replace(`* [ ] ${task}`, '');
      } else {
        filtered = filtered.replace(`* [ ] ${task}`, `* [x] ${task}`);
      }
    });
    
    return filtered.split('\n').filter(line => line.trim() !== '').join('\n');
  };

  const handleClosing = () => {
    const today = new Date().toLocaleDateString('id-ID');
    const todayTransactions = transactions.filter(t => new Date(t.date).toLocaleDateString('id-ID') === today);
    const todayExpenses = expenses.filter(e => new Date(e.date).toLocaleDateString('id-ID') === today);
    
    const totalSales = todayTransactions.reduce((acc, t) => acc + t.totalPrice, 0);
    const totalExp = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalSales - totalExp;

    alert(`Laporan Closing Hari Ini (${today}):\n\nTotal Penjualan: ${formatCurrency(totalSales)}\nTotal Pengeluaran: ${formatCurrency(totalExp)}\nLaba Bersih: ${formatCurrency(netProfit)}\n\nSaldo Petty Cash Akhir: ${formatCurrency(pettyCash)}`);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        {activeTab === "home" && (
          <Dashboard 
            transactions={transactions}
            recipes={recipes}
            ingredients={ingredients}
            expenses={expenses}
            pettyCash={pettyCash}
            onTabChange={setActiveTab}
            handleBackup={handleBackup}
            handleRestore={handleRestore}
            handleClosing={handleClosing}
          />
        )}

        {activeTab === "bahan" && (
          <BahanManager 
            ingredients={ingredients}
            setIngredients={setIngredients}
            recipes={recipes}
            setRecipes={setRecipes}
            deleteIngredient={deleteIngredient}
            handleExportInventoryPDF={() => pdfService.handleExportInventoryPDF(ingredients, recipes)}
          />
        )}

        {activeTab === "resep" && (
          <RecipeManager 
            recipes={recipes}
            setRecipes={setRecipes}
            ingredients={ingredients}
            handleExportRecipePDF={(recipe) => pdfService.handleExportRecipePDF(recipe, ingredients)}
          />
        )}

        {activeTab === "karyawan" && (
          <JobdeskManager 
            employees={employees}
            karyawanTab={karyawanTab}
            setKaryawanTab={setKaryawanTab}
            isAddingEmployee={isAddingEmployee}
            setIsAddingEmployee={setIsAddingEmployee}
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            handleSaveEmployee={() => handleSaveEmployee(newEmployee, editingEmployeeId, setEditingEmployeeId, setIsAddingEmployee, setNewEmployee)}
            deleteEmployee={deleteEmployee}
            selectedTasks={selectedTasks}
            toggleTask={toggleTask}
            reportTitle={reportTitle}
            setReportTitle={setReportTitle}
            handleExportJobdeskPDF={() => pdfService.handleExportJobdeskPDF(selectedTasks, reportTitle)}
            generateFilteredMarkdown={generateFilteredMarkdown}
            selectedEmployeeForSlip={selectedEmployeeForSlip}
            setSelectedEmployeeForSlip={setSelectedEmployeeForSlip}
            shifts={shifts}
            setShifts={setShifts}
            weeklyPattern={weeklyPattern}
            setWeeklyPattern={setWeeklyPattern}
          />
        )}
      </div>
    </Layout>
  );
}
