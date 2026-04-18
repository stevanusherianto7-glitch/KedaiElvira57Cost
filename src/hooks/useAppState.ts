import * as React from "react";
import { Ingredient, Recipe, Employee, Transaction, Expense, Unit, RecipeItem, ShiftType } from "../types";
import { CATEGORIES } from "../constants";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

export function useAppState() {
  const [user, setUser] = React.useState<User | null>(null);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [pettyCash, setPettyCash] = React.useState<number>(0);
  const [shifts, setShifts] = React.useState<Record<string, Record<string, ShiftType>>>(() => {
    try {
      const saved = localStorage.getItem("resto-shift-data");
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [weeklyPattern, setWeeklyPattern] = React.useState<Record<string, ShiftType[]>>(() => {
    try {
      const saved = localStorage.getItem("resto-shift-pattern");
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Auth Listener
  React.useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error.message);
          // If refresh token is invalid, sign out to clear the bad state
          if (error.message.includes("Refresh Token")) {
            await supabase.auth.signOut();
          }
        }
        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load data from Supabase or localStorage
  React.useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        if (user) {
          // Fetch from Supabase with a timeout
          const fetchData = async () => {
            try {
              const { data: ingData } = await supabase.from('ingredients').select('*');
              const { data: recData } = await supabase.from('recipes').select('*');
              const { data: empData } = await supabase.from('employees').select('*');
              const { data: transData } = await supabase.from('transactions').select('*');
              
              // Fetch shifts and patterns
              const { data: shiftData } = await supabase.from('shifts').select('*');
              const { data: patternData } = await supabase.from('shift_patterns').select('*');

              if (mounted) {
                if (ingData) setIngredients(ingData);
                if (recData) setRecipes(recData);
                if (empData) setEmployees(empData);
                if (transData) setTransactions(transData);
                
                if (shiftData) {
                  const formattedShifts: Record<string, Record<string, ShiftType>> = {};
                  shiftData.forEach(s => {
                    if (!formattedShifts[s.employee_id]) formattedShifts[s.employee_id] = {};
                    formattedShifts[s.employee_id][s.date] = s.shift_type as ShiftType;
                  });
                  setShifts(formattedShifts);
                }
                if (patternData) {
                  const formattedPatterns: Record<string, ShiftType[]> = {};
                  patternData.forEach(p => {
                    formattedPatterns[p.employee_id] = p.pattern as ShiftType[];
                  });
                  setWeeklyPattern(formattedPatterns);
                }
              }
            } catch (err) {
              console.error("Supabase fetch exception:", err);
            }
          };

          // Race between fetch and a 5s timeout
          await Promise.race([
            fetchData(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
          ]).catch(err => {
            console.warn("Supabase fetch failed or timed out, using local state if any:", err);
          });
        }
        
        // Always try to load from localStorage as well or as fallback
        try {
          const savedIngredients = localStorage.getItem("resto_ingredients");
          const savedRecipes = localStorage.getItem("resto_recipes");
          const savedEmployees = localStorage.getItem("resto_employees");
          const savedTransactions = localStorage.getItem("resto_transactions");
          const savedExpenses = localStorage.getItem("resto_expenses");
          const savedPettyCash = localStorage.getItem("resto_petty_cash");
  
          if (mounted) {
            if (savedIngredients && ingredients.length === 0) setIngredients(JSON.parse(savedIngredients));
            if (savedRecipes && recipes.length === 0) setRecipes(JSON.parse(savedRecipes));
            if (savedEmployees && employees.length === 0) setEmployees(JSON.parse(savedEmployees));
            if (savedTransactions && transactions.length === 0) setTransactions(JSON.parse(savedTransactions));
            if (savedExpenses && expenses.length === 0) setExpenses(JSON.parse(savedExpenses));
            if (savedPettyCash) setPettyCash(Number(savedPettyCash));
          }
        } catch (e) {
          console.error("LocalStorage parse error:", e);
        }
      } catch (error) {
        console.error("Error in loadData sequence:", error);
      } finally {
        if (mounted) {
          console.log("Setting isLoaded to true");
          setIsLoaded(true);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Save data to localStorage & Supabase
  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto_ingredients", JSON.stringify(ingredients));
    
    const syncIngredients = async () => {
      if (user && ingredients.length > 0) {
        setIsSyncing(true);
        const ingredientsWithUser = ingredients.map(ing => ({
          ...ing,
          user_id: user.id
        }));
        await supabase.from('ingredients').upsert(ingredientsWithUser);
        setIsSyncing(false);
      }
    };
    syncIngredients();
  }, [ingredients, isLoaded, user]);

  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto_recipes", JSON.stringify(recipes));

    const syncRecipes = async () => {
      if (user && recipes.length > 0) {
        setIsSyncing(true);
        const recipesWithUser = recipes.map(rec => ({
          ...rec,
          user_id: user.id
        }));
        await supabase.from('recipes').upsert(recipesWithUser);
        setIsSyncing(false);
      }
    };
    syncRecipes();
  }, [recipes, isLoaded, user]);

  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto_employees", JSON.stringify(employees));

    const syncEmployees = async () => {
      if (user && employees.length > 0) {
        setIsSyncing(true);
        const employeesWithUser = employees.map(emp => ({
          ...emp,
          user_id: user.id
        }));
        await supabase.from('employees').upsert(employeesWithUser);
        setIsSyncing(false);
      }
    };
    syncEmployees();
  }, [employees, isLoaded, user]);

  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto_transactions", JSON.stringify(transactions));
  }, [transactions, isLoaded]);

  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto_expenses", JSON.stringify(expenses));
  }, [expenses, isLoaded]);

  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto_petty_cash", pettyCash.toString());
  }, [pettyCash, isLoaded]);

  // Sync Shifts to Supabase
  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto-shift-data", JSON.stringify(shifts));

    const syncShifts = async () => {
      if (user && Object.keys(shifts).length > 0) {
        setIsSyncing(true);
        const shiftList: any[] = [];
        Object.entries(shifts).forEach(([employee_id, days]) => {
          Object.entries(days).forEach(([date, shift_type]) => {
            shiftList.push({
              employee_id,
              date,
              shift_type,
              user_id: user.id
            });
          });
        });
        
        // Supabase upsert requires unique constraint. In this case, employee_id + date.
        // Assuming the table unique constraint is (employee_id, date)
        if (shiftList.length > 0) {
          await supabase.from('shifts').upsert(shiftList, { onConflict: 'employee_id,date' });
        }
        setIsSyncing(false);
      }
    };
    syncShifts();
  }, [shifts, isLoaded, user]);

  // Sync Patterns to Supabase
  React.useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("resto-shift-pattern", JSON.stringify(weeklyPattern));

    const syncPatterns = async () => {
      if (user && Object.keys(weeklyPattern).length > 0) {
        setIsSyncing(true);
        const patternList = Object.entries(weeklyPattern).map(([employee_id, pattern]) => ({
          employee_id,
          pattern,
          user_id: user.id
        }));
        await supabase.from('shift_patterns').upsert(patternList, { onConflict: 'employee_id' });
        setIsSyncing(false);
      }
    };
    syncPatterns();
  }, [weeklyPattern, isLoaded, user]);

  const deleteIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const handleBackup = () => {
    const data = {
      ingredients,
      recipes,
      employees,
      transactions,
      expenses,
      pettyCash
    };
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restocost_backup_${new Date().toISOString()}.json`;
    a.click();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setIngredients(data.ingredients);
        setRecipes(data.recipes);
        setEmployees(data.employees);
        setTransactions(data.transactions);
        setExpenses(data.expenses);
        setPettyCash(data.pettyCash);
        alert("Data berhasil dipulihkan!");
      } catch (err) {
        alert("Gagal memulihkan data. Pastikan file backup valid.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddIngredient = (newIngredient: Partial<Ingredient>, setIsAddingIngredient: (val: boolean) => void, setNewIngredient: (val: Partial<Ingredient>) => void) => {
    if (!newIngredient.name) {
      alert("Nama bahan baku wajib diisi!");
      return;
    }
    if ((newIngredient.purchasePrice || 0) <= 0) {
      alert("Harga beli harus lebih besar dari 0!");
      return;
    }
    if ((newIngredient.conversionValue || 0) <= 0) {
      alert("Nilai konversi harus lebih besar dari 0!");
      return;
    }
    
    if (ingredients.some(i => i.name.toLowerCase() === newIngredient.name?.toLowerCase())) {
      alert("Bahan baku dengan nama tersebut sudah ada!");
      return;
    }
    
    const toTitleCase = (str: string) => {
      return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    };

    const ingredient: Ingredient = {
      ...newIngredient as Ingredient,
      name: toTitleCase(newIngredient.name || ""),
      id: crypto.randomUUID(),
    };
    
    setIngredients([...ingredients, ingredient]);
    setIsAddingIngredient(false);
    setNewIngredient({
      name: "",
      category: CATEGORIES[0],
      purchasePrice: 0,
      purchaseUnit: "kg",
      useUnit: "gr",
      conversionValue: 1000,
      stockQuantity: 0,
      lowStockThreshold: 0
    });
  };

  const handleAddExpense = (
    newExpense: Partial<Expense>,
    setIsAddingExpense: (val: boolean) => void,
    setNewExpense: (val: Partial<Expense>) => void
  ) => {
    if (!newExpense.description || !newExpense.amount) return;
    
    if (newExpense.amount > pettyCash) {
      alert("Saldo Petty Cash tidak mencukupi untuk pengeluaran ini!");
      return;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category as any
    };
    setExpenses([expense, ...expenses]);
    setPettyCash(prev => prev - expense.amount);
    setIsAddingExpense(false);
    setNewExpense({ description: "", amount: 0, category: 'Operasional' });
  };

  const handleSaveEmployee = (
    newEmployee: Partial<Employee>,
    editingEmployeeId: string | null,
    setEditingEmployeeId: (val: string | null) => void,
    setIsAddingEmployee: (val: boolean) => void,
    setNewEmployee: (val: Partial<Employee>) => void
  ) => {
    if (!newEmployee.name) return;
    
    if (editingEmployeeId) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployeeId ? { ...emp, ...newEmployee as Employee } : emp
      ));
      setEditingEmployeeId(null);
    } else {
      const employee: Employee = {
        ...newEmployee as Employee,
        id: crypto.randomUUID(),
      };
      setEmployees([...employees, employee]);
    }
    setIsAddingEmployee(false);
    setNewEmployee({ name: "", role: "", salary: 0 });
  };

  React.useEffect(() => {
    console.log("isLoaded changed to:", isLoaded);
  }, [isLoaded]);

  return {
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
  };
}
