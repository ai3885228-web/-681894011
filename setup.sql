-- ==========================================
-- RESTAURANT APP DATABASE SETUP FOR SUPABASE - THAI EDITION
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
VALUES ('admin', 'password123', 'ผู้จัดการ แอดมิน', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed default menu items (Thai Edition)
INSERT INTO menu_items (name, price, description, category, image_url, available)
VALUES 
('สปาเก็ตตี้คาโบนาร่า', 189.00, 'เส้นสปาเก็ตตี้เหนียวนุ่ม ผัดซอสครีมข้มข้นสูตรอิตาเลียนแท้ โรยพาเมซานชีสและเบคอนกรอบหอมกรุ่น', 'main', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80', true),
('เบอร์เกอร์เนื้อวากิวพรีเมียม', 259.00, 'เนื้อวากิวบดชิ้นโตย่างชุ่มฉ่ำ ประกบเชดดาร์ชีสเยิ้ม หอมใหญ่ผัดหวาน และซอสโฮมเมดสูตรพิเศษบนขนมปังบริออช', 'main', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', true),
('ซีซาร์สลัดอกไก่ย่าง', 159.00, 'ผักสลัดคอสกรอบสด คลุกเคล้าน้ำสลัดซีซาร์สูตรดั้งเดิม โรยเบคอนกรอบ ขนมปังกรอบ และอกไก่ย่างเนื้อนุ่ม', 'appetizer', 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80', true),
('เฟรนช์ฟรายส์ซอสทรัฟเฟิล', 129.00, 'มันฝรั่งทอดชิ้นหนาสีเหลืองทองกรอบนอกนุ่มใน คลุกเคล้าน้ำมันเห็ดทรัฟเฟิลและพาร์เมซานชีสขูดสด', 'appetizer', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f8777?w=600&auto=format&fit=crop&q=80', true),
('นิวยอร์กชีสเค้กคลาสสิก', 119.00, 'ชีสเค้กเนื้อครีมเนียนนุ่ม หอมมัน เข้มข้น บนฐานบิสกิตอบเนยกรุบกรอบ เสิร์ฟพร้อมซอสสตรอว์เบอร์รี่รสเปรี้ยวหวาน', 'dessert', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80', true),
('ช็อกโกแลตลาวาเค้ก', 139.00, 'เค้กช็อกโกแลตอุ่นร้อน สอดไส้ซอสช็อกโกแลตเบลเยียมเข้มข้นเยิ้มๆ เสิร์ฟพร้อมไอศกรีมวานิลลาเม็ดแท้', 'dessert', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80', true),
('มัทฉะลาเต้เย็นสูตรพิเศษ', 85.00, 'ผงมัทฉะแท้เกรดพิธีการนำเข้าจากญี่ปุ่น ชงเข้มข้นผสมนมสดแท้ เพิ่มความหวานละมุนด้วยน้ำผึ้งป่าแท้', 'drink', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80', true),
('น้ำมะพร้าวน้ำหอมสดแท้', 75.00, 'น้ำมะพร้าวออร์แกนิกคัดเกรดเสิร์ฟแช่เย็นเจาะสดๆ รสชาติหวานหอมกลมกล่อมจากธรรมชาติ ดับร้อนได้ดีเยี่ยม', 'drink', 'https://images.unsplash.com/photo-1525385133336-254847240f92?w=600&auto=format&fit=crop&q=80', true)
ON CONFLICT DO NOTHING;
