// ==========================================
// DATABASE CONTROLLER (SUPABASE & LOCAL STORAGE) - THAI EDITION
// ==========================================

const MOCK_MENU = [
    {
        id: "m1",
        name: "สปาเก็ตตี้คาโบนาร่า",
        price: 189.00,
        description: "เส้นสปาเก็ตตี้เหนียวนุ่ม ผัดซอสครีมข้มข้นสูตรอิตาเลียนแท้ โรยพาเมซานชีสและเบคอนกรอบหอมกรุ่น",
        category: "main",
        image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: "m2",
        name: "เบอร์เกอร์เนื้อวากิวพรีเมียม",
        price: 259.00,
        description: "เนื้อวากิวบดชิ้นโตย่างชุ่มฉ่ำ ประกบเชดดาร์ชีสเยิ้ม หอมใหญ่ผัดหวาน และซอสโฮมเมดสูตรพิเศษบนขนมปังบริออช",
        category: "main",
        image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: "m3",
        name: "ซีซาร์สลัดอกไก่ย่าง",
        price: 159.00,
        description: "ผักสลัดคอสกรอบสด คลุกเคล้าน้ำสลัดซีซาร์สูตรดั้งเดิม โรยเบคอนกรอบ ขนมปังกรอบ และอกไก่ย่างเนื้อนุ่ม",
        category: "appetizer",
        image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: "m4",
        name: "เฟรนช์ฟรายส์ซอสทรัฟเฟิล",
        price: 129.00,
        description: "มันฝรั่งทอดชิ้นหนาสีเหลืองทองกรอบนอกนุ่มใน คลุกเคล้าน้ำมันเห็ดทรัฟเฟิลและพาร์เมซานชีสขูดสด",
        category: "appetizer",
        image_url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: "m5",
        name: "นิวยอร์กชีสเค้กคลาสสิก",
        price: 119.00,
        description: "ชีสเค้กเนื้อครีมเนียนนุ่ม หอมมัน เข้มข้น บนฐานบิสกิตอบเนยกรุบกรอบ เสิร์ฟพร้อมซอสสตรอว์เบอร์รี่รสเปรี้ยวหวาน",
        category: "dessert",
        image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: "m6",
        name: "ช็อกโกแลตลาวาเค้ก",
        price: 139.00,
        description: "เค้กช็อกโกแลตอุ่นร้อน สอดไส้ซอสช็อกโกแลตเบลเยียมเข้มข้นเยิ้มๆ เสิร์ฟพร้อมไอศกรีมวานิลลาเม็ดแท้",
        category: "dessert",
        image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: "m7",
        name: "มัทฉะลาเต้เย็นสูตรพิเศษ",
        price: 85.00,
        description: "ผงมัทฉะแท้เกรดพิธีการนำเข้าจากญี่ปุ่น ชงเข้มข้นผสมนมสดแท้ เพิ่มความหวานละมุนด้วยน้ำผึ้งป่าแท้",
        category: "drink",
        image_url: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: "m8",
        name: "น้ำมะพร้าวน้ำหอมสดแท้",
        price: 75.00,
        description: "น้ำมะพร้าวออร์แกนิกคัดเกรดเสิร์ฟแช่เย็นเจาะสดๆ รสชาติหวานหอมกลมกล่อมจากธรรมชาติ ดับร้อนได้ดีเยี่ยม",
        category: "drink",
        image_url: "https://images.unsplash.com/photo-1525385133336-254847240f92?w=600&auto=format&fit=crop&q=80",
        available: true
    }
];

class RestaurantDB {
    constructor() {
        this.supabase = null;
        this.isSupabase = false;
        this.initConnection();
    }

    initConnection() {
        // Try reading configuration dynamically
        const config = window.SUPABASE_CONFIG || {};
        const url = localStorage.getItem('supabase_url') || config.URL || "";
        const anonKey = localStorage.getItem('supabase_anon_key') || config.ANON_KEY || "";

        if (url && anonKey && window.supabase) {
            try {
                this.supabase = window.supabase.createClient(url, anonKey);
                this.isSupabase = true;
                console.log("Database initialized: Connected to Supabase");
            } catch (e) {
                console.error("Failed to initialize Supabase client. Falling back to LocalStorage:", e);
                this.isSupabase = false;
            }
        } else {
            console.warn("Supabase credentials not configured. Falling back to LocalStorage.");
            this.isSupabase = false;
        }

        if (!this.isSupabase) {
            this.initLocalStorage();
        }
    }

    initLocalStorage() {
        if (!localStorage.getItem('rest_menu')) {
            localStorage.setItem('rest_menu', JSON.stringify(MOCK_MENU));
        }
        if (!localStorage.getItem('rest_orders')) {
            localStorage.setItem('rest_orders', JSON.stringify([]));
        }
        if (!localStorage.getItem('rest_staff')) {
            localStorage.setItem('rest_staff', JSON.stringify([
                { id: "s1", username: "admin", password: "password123", name: "ผู้จัดการ แอดมิน", role: "admin" }
            ]));
        }
        if (!localStorage.getItem('rest_settings')) {
            localStorage.setItem('rest_settings', JSON.stringify({
                restaurantName: "เดอะ เทสตี้ เพลท (The Tasty Plate)",
                address: "123 ถนนอาหารอร่อย แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
                phone: "02-123-4567",
                taxRate: 7.0, // 7%
                serviceChargeRate: 10.0, // 10%
                receiptFooter: "ขอบคุณที่มาใช้บริการ! ขอให้เป็นวันแสนวิเศษของคุณ"
            }));
        }
    }

    setSupabaseCredentials(url, anonKey) {
        if (url && anonKey) {
            localStorage.setItem('supabase_url', url);
            localStorage.setItem('supabase_anon_key', anonKey);
        } else {
            localStorage.removeItem('supabase_url');
            localStorage.removeItem('supabase_anon_key');
        }
        this.initConnection();
        return this.isSupabase;
    }

    getCredentials() {
        const config = window.SUPABASE_CONFIG || {};
        return {
            url: localStorage.getItem('supabase_url') || config.URL || "",
            anonKey: localStorage.getItem('supabase_anon_key') || config.ANON_KEY || ""
        };
    }

    // ==========================================
    // MENU ACTIONS
    // ==========================================

    async getMenuItems() {
        if (this.isSupabase) {
            const { data, error } = await this.supabase
                .from('menu_items')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error("Supabase Error getting menu items:", error);
                return JSON.parse(localStorage.getItem('rest_menu') || '[]');
            }
            return data;
        } else {
            return JSON.parse(localStorage.getItem('rest_menu'));
        }
    }

    async addMenuItem(item) {
        if (this.isSupabase) {
            const newItem = {
                name: item.name,
                price: parseFloat(item.price),
                description: item.description,
                category: item.category,
                image_url: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
                available: item.available !== undefined ? item.available : true
            };
            const { data, error } = await this.supabase
                .from('menu_items')
                .insert([newItem])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const menu = JSON.parse(localStorage.getItem('rest_menu'));
            const newItem = {
                id: 'm_' + Date.now(),
                name: item.name,
                price: parseFloat(item.price),
                description: item.description,
                category: item.category,
                image_url: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
                available: item.available !== undefined ? item.available : true
            };
            menu.push(newItem);
            localStorage.setItem('rest_menu', JSON.stringify(menu));
            return newItem;
        }
    }

    async updateMenuItem(id, updatedFields) {
        if (this.isSupabase) {
            const { data, error } = await this.supabase
                .from('menu_items')
                .update(updatedFields)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const menu = JSON.parse(localStorage.getItem('rest_menu'));
            const index = menu.findIndex(item => item.id === id);
            if (index !== -1) {
                menu[index] = { ...menu[index], ...updatedFields };
                localStorage.setItem('rest_menu', JSON.stringify(menu));
                return menu[index];
            }
            throw new Error("Item not found");
        }
    }

    async deleteMenuItem(id) {
        if (this.isSupabase) {
            const { error } = await this.supabase
                .from('menu_items')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } else {
            let menu = JSON.parse(localStorage.getItem('rest_menu'));
            menu = menu.filter(item => item.id !== id);
            localStorage.setItem('rest_menu', JSON.stringify(menu));
            return true;
        }
    }

    // ==========================================
    // ORDER ACTIONS
    // ==========================================

    async getOrders() {
        if (this.isSupabase) {
            const { data, error } = await this.supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error("Supabase Error getting orders:", error);
                return JSON.parse(localStorage.getItem('rest_orders') || '[]');
            }
            return data;
        } else {
            return JSON.parse(localStorage.getItem('rest_orders') || '[]');
        }
    }

    async createOrder(order) {
        const orderNumber = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const settings = await this.getSettings();
        
        const serviceCharge = parseFloat((subtotal * (settings.serviceChargeRate / 100)).toFixed(2));
        const taxableAmount = subtotal + serviceCharge;
        const tax = parseFloat((taxableAmount * (settings.taxRate / 100)).toFixed(2));
        const total = parseFloat((taxableAmount + tax).toFixed(2));

        const orderData = {
            order_number: orderNumber,
            customer_name: order.customer_name || "ลูกค้าทั่วไป",
            table_number: order.table_number || "หิ้วกลับบ้าน",
            items: order.items,
            subtotal: subtotal,
            tax: tax,
            service_charge: serviceCharge,
            total: total,
            status: "pending"
        };

        if (this.isSupabase) {
            const { data, error } = await this.supabase
                .from('orders')
                .insert([orderData])
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const orders = JSON.parse(localStorage.getItem('rest_orders') || '[]');
            const localOrder = {
                id: 'o_' + Date.now(),
                ...orderData,
                created_at: new Date().toISOString()
            };
            orders.unshift(localOrder);
            localStorage.setItem('rest_orders', JSON.stringify(orders));
            return localOrder;
        }
    }

    async updateOrderStatus(id, status) {
        if (this.isSupabase) {
            const { data, error } = await this.supabase
                .from('orders')
                .update({ status: status })
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        } else {
            const orders = JSON.parse(localStorage.getItem('rest_orders'));
            const index = orders.findIndex(order => order.id === id);
            if (index !== -1) {
                orders[index].status = status;
                localStorage.setItem('rest_orders', JSON.stringify(orders));
                return orders[index];
            }
            throw new Error("Order not found");
        }
    }

    // ==========================================
    // AUTH & STAFF
    // ==========================================

    async loginStaff(username, password) {
        if (this.isSupabase) {
            const { data, error } = await this.supabase
                .from('staff_users')
                .select('*')
                .eq('username', username)
                .eq('password', password);
            
            if (error) {
                console.error("Supabase login error:", error);
                return this.localLoginStaff(username, password);
            }
            if (data && data.length > 0) {
                const user = data[0];
                localStorage.setItem('rest_current_user', JSON.stringify(user));
                return user;
            }
            return null;
        } else {
            return this.localLoginStaff(username, password);
        }
    }

    localLoginStaff(username, password) {
        const staff = JSON.parse(localStorage.getItem('rest_staff') || '[]');
        const user = staff.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem('rest_current_user', JSON.stringify(user));
            return user;
        }
        return null;
    }

    getCurrentUser() {
        const userJson = localStorage.getItem('rest_current_user');
        return userJson ? JSON.parse(userJson) : null;
    }

    logout() {
        localStorage.removeItem('rest_current_user');
    }

    // ==========================================
    // SETTINGS
    // ==========================================

    async getSettings() {
        return JSON.parse(localStorage.getItem('rest_settings')) || {
            restaurantName: "เดอะ เทสตี้ เพลท (The Tasty Plate)",
            address: "123 ถนนอาหารอร่อย แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
            phone: "02-123-4567",
            taxRate: 7.0,
            serviceChargeRate: 10.0,
            receiptFooter: "ขอบคุณที่มาใช้บริการ! ขอให้เป็นวันแสนวิเศษของคุณ"
        };
    }

    async updateSettings(updatedSettings) {
        const settings = { ...await this.getSettings(), ...updatedSettings };
        localStorage.setItem('rest_settings', JSON.stringify(settings));
        return settings;
    }
}

// Instantiate database object globally
window.db = new RestaurantDB();
