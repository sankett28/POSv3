-- Initial database schema for Retail Boss POS V1
-- Ledger-based inventory with immutable bills

BEGIN;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT products_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Inventory ledger (immutable stock movements)
CREATE TABLE IF NOT EXISTS inventory_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,  -- Positive = incoming, Negative = outgoing
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('INCOMING', 'OUTGOING')),
    reference_id UUID,  -- bill_id for sales, purchase_id for purchases
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT inventory_ledger_quantity_not_zero CHECK (quantity_change != 0)
);

-- Bills (immutable sales bills)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bill_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(20) DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'UPI', 'CARD')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT bills_bill_number_unique UNIQUE (user_id, bill_number)
);

-- Bill items (line items for each bill)
CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_product_id ON inventory_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_user_id ON inventory_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_created_at ON inventory_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON bill_items(product_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage their own products" ON products
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own inventory ledger" ON inventory_ledger
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory ledger entries" ON inventory_ledger
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bills" ON bills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bill items" ON bill_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = bill_items.bill_id 
            AND bills.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own bill items" ON bill_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bills 
            WHERE bills.id = bill_items.bill_id 
            AND bills.user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for products updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate bill numbers
CREATE OR REPLACE FUNCTION generate_bill_number(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    bill_count INTEGER;
    bill_number VARCHAR(50);
BEGIN
    SELECT COALESCE(COUNT(*), 0) + 1 INTO bill_count
    FROM bills
    WHERE user_id = user_uuid
    AND DATE(created_at) = CURRENT_DATE;
    
    bill_number := 'BILL-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(bill_count::TEXT, 4, '0');
    
    RETURN bill_number;
END;
$$ LANGUAGE plpgsql;

COMMIT;

