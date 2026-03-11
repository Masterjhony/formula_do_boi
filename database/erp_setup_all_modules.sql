-- ==========================================
-- ERP SCHEMAS FOR FORMULA DO BOI
-- MODULES: Financeiro, Estoque, Contábil
-- ==========================================

-- 1. ENUMS AND SHARED TYPES
-- ==========================================

DO $$ BEGIN
    CREATE TYPE finance_account_type AS ENUM ('checking', 'savings', 'cash', 'credit_card');
    CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled');
    CREATE TYPE inventory_category AS ENUM ('animal', 'semen', 'embryo', 'equipment', 'feed', 'vaccine', 'general');
    CREATE TYPE inventory_movement_type AS ENUM ('in', 'out', 'transfer', 'adjustment');
    CREATE TYPE accounting_account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
    CREATE TYPE accounting_entry_status AS ENUM ('draft', 'posted', 'voided');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. FINANCEIRO (Financial Module)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.erp_finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type finance_account_type NOT NULL,
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.erp_finance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    parent_id UUID REFERENCES public.erp_finance_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.erp_finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.erp_finance_accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.erp_finance_categories(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    status transaction_status DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ESTOQUE E INVENTÁRIO (Inventory Module)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.erp_inventory_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.erp_inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category inventory_category DEFAULT 'general',
    sub_category VARCHAR(100), -- e.g., 'Nelore Pintado PO', 'Gado Comercial', 'Angus'
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    description TEXT,
    unit_measure VARCHAR(50) DEFAULT 'UN', -- UN, KG, L, DOSE
    cost_price DECIMAL(15, 2) DEFAULT 0.00,
    sale_price DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.erp_inventory_stock (
    product_id UUID REFERENCES public.erp_inventory_products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.erp_inventory_warehouses(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 3) DEFAULT 0.000,
    min_quantity DECIMAL(15, 3) DEFAULT 0.000,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS public.erp_inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.erp_inventory_products(id),
    warehouse_id UUID NOT NULL REFERENCES public.erp_inventory_warehouses(id),
    type inventory_movement_type NOT NULL,
    quantity DECIMAL(15, 3) NOT NULL,
    reference_id UUID,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_by UUID
);


-- 4. CONTÁBIL BÁSICO (Accounting Module)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.erp_accounting_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type accounting_account_type NOT NULL,
    is_group BOOLEAN DEFAULT false,
    parent_id UUID REFERENCES public.erp_accounting_accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.erp_accounting_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_date DATE NOT NULL,
    reference VARCHAR(255),
    description TEXT,
    status accounting_entry_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.erp_accounting_journal_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES public.erp_accounting_journals(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.erp_accounting_accounts(id),
    debit DECIMAL(15, 2) DEFAULT 0.00,
    credit DECIMAL(15, 2) DEFAULT 0.00,
    description TEXT,
    CONSTRAINT debit_or_credit CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0))
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

ALTER TABLE public.erp_finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_inventory_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_accounting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_accounting_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_accounting_journal_lines ENABLE ROW LEVEL SECURITY;

-- Creating general policies allowing authenticated users full access in the ERP scope
-- (For production, these would be filtered by user roles like 'finance_manager', 'inventory_clerk', etc.)

CREATE POLICY "Allow authenticated users full access to finance_accounts" ON public.erp_finance_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to finance_categories" ON public.erp_finance_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to finance_transactions" ON public.erp_finance_transactions FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to inventory_warehouses" ON public.erp_inventory_warehouses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to inventory_products" ON public.erp_inventory_products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to inventory_stock" ON public.erp_inventory_stock FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to inventory_movements" ON public.erp_inventory_movements FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users full access to accounting_accounts" ON public.erp_accounting_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to accounting_journals" ON public.erp_accounting_journals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access to accounting_journal_lines" ON public.erp_accounting_journal_lines FOR ALL TO authenticated USING (true);
