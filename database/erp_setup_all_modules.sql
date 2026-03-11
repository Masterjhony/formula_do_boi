-- ==========================================
-- ERP SCHEMAS FOR FORMULA DO BOI
-- MODULES: Financeiro, Estoque, Contábil
-- ==========================================

-- 1. FINANCEIRO (Financial Module)
-- ==========================================

CREATE TABLE public.erp_finance_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('checking', 'savings', 'cash', 'credit_card')),
    initial_balance DECIMAL(15, 2) DEFAULT 0.00,
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.erp_finance_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    parent_id UUID REFERENCES public.erp_finance_categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.erp_finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.erp_finance_accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.erp_finance_categories(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 2. ESTOQUE E INVENTÁRIO (Inventory Module)
-- ==========================================

CREATE TABLE public.erp_inventory_warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.erp_inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    description TEXT,
    unit_measure VARCHAR(50) DEFAULT 'UN',
    cost_price DECIMAL(15, 2) DEFAULT 0.00,
    sale_price DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.erp_inventory_stock (
    product_id UUID REFERENCES public.erp_inventory_products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES public.erp_inventory_warehouses(id) ON DELETE CASCADE,
    quantity DECIMAL(15, 3) DEFAULT 0.000,
    min_quantity DECIMAL(15, 3) DEFAULT 0.000,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (product_id, warehouse_id)
);

CREATE TABLE public.erp_inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.erp_inventory_products(id),
    warehouse_id UUID NOT NULL REFERENCES public.erp_inventory_warehouses(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('in', 'out', 'transfer', 'adjustment')),
    quantity DECIMAL(15, 3) NOT NULL,
    reference_id UUID, -- Optional link to a purchase/sale order
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_by UUID -- Optionally link to auth.users
);


-- 3. CONTÁBIL BÁSICO (Accounting Module)
-- ==========================================

CREATE TABLE public.erp_accounting_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., '1.1.1.01'
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    is_group BOOLEAN DEFAULT false, -- If true, it's a parent account that doesn't receive direct posts
    parent_id UUID REFERENCES public.erp_accounting_accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.erp_accounting_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_date DATE NOT NULL,
    reference VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'voided')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.erp_accounting_journal_lines (
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
-- (You can customize these to fit your auth setup, leaving them open or restricted by role)
-- e.g., 
-- ALTER TABLE public.erp_finance_accounts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow full access for authenticated users" ON public.erp_finance_accounts FOR ALL TO authenticated USING (true);
