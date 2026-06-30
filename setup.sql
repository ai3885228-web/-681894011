-- ==========================================
-- RESTAURANT APP DATABASE SETUP FOR SUPABASE
-- Copy and paste this script into your Supabase SQL Editor
-- ==========================================

-- 1. Create Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'appetizer', 'main', 'dessert', 'drink'
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    table_number TEXT,
    items JSONB NOT NULL, -- Array of items: [{id, name, price, quantity}]
    subtotal NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    service_charge NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Staff Users Table
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Plaintext/hashed password for simple backoffice login
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff', -- 'admin', 'staff'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (Optional - we will allow public access for simplicity in this frontend-only app, but you can configure policies later)
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users DISABLE ROW LEVEL SECURITY;

-- 5. Seed Default Data

-- Seed default staff user (username: admin, password: password123)
INSERT INTO staff_users (username, password, name, role)
VALUES ('admin', 'password123', 'Manager Admin', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed default menu items
INSERT INTO menu_items (name, price, description, category, image_url, available)
VALUES 
('Spaghetti Carbonara', 189.00, 'Classic Italian pasta with creamy egg sauce, parmesan cheese, and crispy bacon.', 'main', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80', true),
('Wagyu Beef Burger', 259.00, 'Premium Wagyu beef patty, cheddar cheese, caramelized onions, and signature burger sauce on brioche bun.', 'main', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true),
('Caesar Salad with Grilled Chicken', 159.00, 'Fresh romaine lettuce tossed with Caesar dressing, croutons, parmesan cheese, and tender grilled chicken.', 'appetizer', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80', true),
('Truffle French Fries', 129.00, 'Golden crispy french fries tossed with white truffle oil, sea salt, and grated parmesan cheese.', 'appetizer', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80', true),
('New York Cheesecake', 119.00, 'Rich and creamy classic baked cheesecake with a sweet graham cracker crust and raspberry coulis.', 'dessert', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80', true),
('Chocolate Lava Cake', 139.00, 'Warm chocolate cake with a molten chocolate center, served with vanilla bean ice cream.', 'dessert', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', true),
('Iced Matcha Latte', 85.00, 'Premium Japanese Uji matcha whisked with fresh milk and sweetened with organic honey.', 'drink', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80', true),
('Fresh Thai Coconut Water', 75.00, 'Chilled young organic coconut served whole, naturally sweet and refreshing.', 'drink', 'https://images.unsplash.com/photo-1525385133336-254847240f92?w=600&auto=format&fit=crop&q=80', true)
ON CONFLICT DO NOTHING;
