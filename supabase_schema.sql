-- Supabase Schema for RestoCost ERP Engine

-- 1. Ingredients Table (Bahan Baku)
CREATE TABLE ingredients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    purchase_price DECIMAL(15, 2) NOT NULL,
    purchase_unit TEXT NOT NULL, -- e.g., 'kg', 'karung'
    use_unit TEXT NOT NULL,      -- e.g., 'gr', 'pcs'
    conversion_value DECIMAL(15, 2) NOT NULL, -- e.g., 1000 (1kg = 1000gr)
    stock_quantity DECIMAL(15, 2) DEFAULT 0,
    low_stock_threshold DECIMAL(15, 2) DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Recipes Table (Resep Menu)
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    selling_price DECIMAL(15, 2) DEFAULT 0,
    markup_percent DECIMAL(5, 2) DEFAULT 0,
    labor_cost DECIMAL(15, 2) DEFAULT 0,
    overhead_cost DECIMAL(15, 2) DEFAULT 0,
    shrinkage_percent DECIMAL(5, 2) DEFAULT 0,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Recipe Items Table (BOM - Bill of Materials)
CREATE TABLE recipe_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_needed DECIMAL(15, 2) NOT NULL, -- in use_unit
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Employees Table (Karyawan)
CREATE TABLE employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    salary DECIMAL(15, 2) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Transactions Table (Optional, for Dashboard Omzet)
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipe_id UUID REFERENCES recipes(id),
    quantity INTEGER NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    total_hpp DECIMAL(15, 2) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can manage their own ingredients" ON ingredients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own recipes" ON recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own recipe items" ON recipe_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own employees" ON employees FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- 6. Shifts Table (Jadwal Shift)
CREATE TABLE shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 7. Shift Patterns Table (Pola Shift)
CREATE TABLE shift_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    pattern JSONB NOT NULL, -- Array of 7 ShiftTypes
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shifts" ON shifts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own shift_patterns" ON shift_patterns FOR ALL USING (auth.uid() = user_id);
