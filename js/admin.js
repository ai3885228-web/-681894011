// ==========================================
// BACKOFFICE AND POS RECEIPT LOGIC - THAI EDITION
// ==========================================

let adminOrders = [];
let adminMenuItems = [];
let revenueChart = null;
let categoryChart = null;

const STATUS_TRANSLATIONS = {
    'pending': 'รอยืนยัน',
    'preparing': 'กำลังปรุง',
    'completed': 'เสร็จสิ้น',
    'cancelled': 'ยกเลิกแล้ว'
};

const CATEGORY_TRANSLATIONS = {
    'appetizer': 'ของทานเล่น',
    'main': 'อาหารจานหลัก',
    'dessert': 'ของหวาน',
    'drink': 'เครื่องดื่ม'
};

// Auth check when entering admin view
async function initAdminPortal() {
    const user = db.getCurrentUser();
    if (!user) {
        alert("กรุณาเข้าสู่ระบบก่อนเข้าใช้งาน");
        navigateTo('login-view');
        return;
    }
    
    // Set Staff metadata
    document.getElementById("staff-name").innerText = user.name;
    document.getElementById("staff-role").innerText = user.role === 'admin' ? 'ผู้จัดการร้าน' : 'พนักงาน';
    
    // Load and render default dashboard data
    switchAdminPanel('dashboard');
    loadDbConfigUI();
    loadRestSettingsUI();
}

// Handle login submissions
async function handleLogin(e) {
    e.preventDefault();
    const userEl = document.getElementById("username");
    const passEl = document.getElementById("password");
    const errorEl = document.getElementById("login-error");
    
    errorEl.style.display = "none";
    
    try {
        const staff = await db.loginStaff(userEl.value, passEl.value);
        if (staff) {
            userEl.value = "";
            passEl.value = "";
            navigateTo('admin-view');
        } else {
            errorEl.style.display = "block";
        }
    } catch(err) {
        console.error("Login failed:", err);
        errorEl.style.display = "block";
    }
}

// Log staff out
function handleLogout() {
    db.logout();
    navigateTo('customer-view');
}

// Switch between backoffice tabs (Dashboard, Orders, Menu, Settings)
function switchAdminPanel(panelName) {
    // Toggles Active Classes on Tabs
    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("onclick").includes(panelName)) {
            item.classList.add("active");
        }
    });

    // Toggles Active Panels
    document.querySelectorAll(".admin-panel").forEach(panel => {
        panel.classList.remove("active");
    });
    
    const targetPanel = document.getElementById(`panel-${panelName}`);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }
    
    // Fetch fresh data based on panels
    if (panelName === 'dashboard') {
        refreshDashboardData();
    } else if (panelName === 'orders') {
        refreshOrdersQueue();
    } else if (panelName === 'menu') {
        refreshAdminMenuTable();
    }
}

// ==========================================
// 1. DASHBOARD INSIGHTS & REPORTS
// ==========================================

async function refreshDashboardData() {
    try {
        adminOrders = await db.getOrders();
        adminMenuItems = await db.getMenuItems();
        
        // Calculate Metrics
        let totalRevenue = 0;
        let completedCount = 0;
        let activeCount = 0;
        const categoryCounts = {};
        
        // Sales grouping (e.g. for charts)
        const salesByDay = {};
        
        adminOrders.forEach(order => {
            const dateStr = new Date(order.created_at).toLocaleDateString();
            
            if (order.status === 'completed') {
                totalRevenue += parseFloat(order.total);
                completedCount++;
                salesByDay[dateStr] = (salesByDay[dateStr] || 0) + parseFloat(order.total);
            } else if (order.status === 'pending' || order.status === 'preparing') {
                activeCount++;
            }
            
            // Count items sold per category
            if (order.status === 'completed' && order.items) {
                order.items.forEach(orderedItem => {
                    const menuItem = adminMenuItems.find(m => m.id === orderedItem.id || m.name === orderedItem.name);
                    if (menuItem) {
                        const cat = menuItem.category;
                        categoryCounts[cat] = (categoryCounts[cat] || 0) + orderedItem.quantity;
                    }
                });
            }
        });
        
        // Calculate top popular category
        let popularCat = "-";
        let maxCount = 0;
        for (const [cat, count] of Object.entries(categoryCounts)) {
            if (count > maxCount) {
                maxCount = count;
                popularCat = CATEGORY_TRANSLATIONS[cat] || cat;
            }
        }
        
        // Render Metric Values
        document.getElementById("metric-revenue").innerText = `฿${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById("metric-completed-count").innerText = completedCount;
        document.getElementById("metric-active-count").innerText = activeCount;
        document.getElementById("metric-popular-category").innerText = popularCat;
        
        // Setup/Refresh Charts
        setupRevenueChart(salesByDay);
        setupCategoryChart(categoryCounts);
        
    } catch(err) {
        console.error("Dashboard refresh error:", err);
    }
}

function setupRevenueChart(salesByDay) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Sort dates
    const labels = Object.keys(salesByDay).slice(-7); // Last 7 days
    const data = labels.map(day => salesByDay[day]);
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length > 0 ? labels : ["ไม่มีข้อมูลการขาย"],
            datasets: [{
                label: 'รายได้จากการขาย (฿)',
                data: data.length > 0 ? data : [0],
                borderColor: '#E2725B',
                backgroundColor: 'rgba(226, 114, 91, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function setupCategoryChart(categoryCounts) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const categories = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories.length > 0 ? categories.map(c => (CATEGORY_TRANSLATIONS[c] || c).toUpperCase()) : ["ไม่มีข้อมูลการขาย"],
            datasets: [{
                data: data.length > 0 ? data : [1],
                backgroundColor: ['#E2725B', '#84A98C', '#E09F3E', '#A8A29E'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// ==========================================
// 2. LIVE ORDERS QUEUE
// ==========================================

async function refreshOrdersQueue() {
    try {
        adminOrders = await db.getOrders();
        const container = document.getElementById("order-queue-container");
        if (!container) return;
        
        container.innerHTML = "";
        
        // Only display active orders (pending and preparing)
        const activeOrders = adminOrders.filter(o => o.status === 'pending' || o.status === 'preparing');
        
        if (activeOrders.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border); color: var(--text-secondary);">
                    ไม่มีรายการอาหารค้างในคิวระบบขณะนี้ 🍹
                </div>
            `;
            return;
        }
        
        activeOrders.forEach(order => {
            const card = document.createElement("div");
            card.className = "order-card";
            
            const timeStr = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(order.created_at).toLocaleDateString();
            
            // Build item rows
            let itemRows = "";
            order.items.forEach(item => {
                itemRows += `
                    <div class="order-item-row">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>฿${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
            });
            
            // Generate contextual primary action button
            let actionBtn = "";
            if (order.status === 'pending') {
                actionBtn = `<button class="btn-action primary" onclick="updateOrderStatus('${order.id}', 'preparing')">ยืนยันรับออเดอร์</button>`;
            } else if (order.status === 'preparing') {
                actionBtn = `<button class="btn-action primary" onclick="updateOrderStatus('${order.id}', 'completed')">เสร็จสิ้น & พิมพ์ใบเสร็จ</button>`;
            }

            card.innerHTML = `
                <div class="order-card-header">
                    <div class="order-meta">
                        <h3>${order.order_number}</h3>
                        <div class="order-time">${dateStr} ${timeStr}</div>
                    </div>
                    <span class="status-badge ${order.status}">${STATUS_TRANSLATIONS[order.status] || order.status}</span>
                </div>
                <div class="order-card-body">
                    <div class="order-customer">
                        👤 ${order.customer_name} | 📍 ${order.table_number}
                    </div>
                    <div class="order-item-list">
                        ${itemRows}
                    </div>
                </div>
                <div class="order-card-footer">
                    <span class="order-total">ยอดรวม: ฿${parseFloat(order.total).toFixed(2)}</span>
                    <div class="order-actions-btn-group">
                        ${actionBtn}
                        <button class="btn-action secondary" onclick="cancelOrder('${order.id}')">ยกเลิกออเดอร์</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch(err) {
        console.error("Order queue refresh error:", err);
    }
}

async function updateOrderStatus(orderId, nextStatus) {
    try {
        const updated = await db.updateOrderStatus(orderId, nextStatus);
        
        // If transitioning to completed, automatically print receipt
        if (nextStatus === 'completed') {
            printReceipt(updated);
        }
        
        refreshOrdersQueue();
    } catch(err) {
        alert("ไม่สามารถเปลี่ยนสถานะออเดอร์ได้: " + err.message);
    }
}

async function cancelOrder(orderId) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?")) {
        await updateOrderStatus(orderId, 'cancelled');
    }
}

// ==========================================
// 3. MENU MANAGEMENT CRUD
// ==========================================

async function refreshAdminMenuTable() {
    try {
        adminMenuItems = await db.getMenuItems();
        const tbody = document.getElementById("admin-menu-list");
        if (!tbody) return;
        
        tbody.innerHTML = "";
        
        adminMenuItems.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div class="admin-item-preview">
                        <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}" class="admin-item-img" alt="${item.name}">
                        <div>
                            <div class="admin-item-name">${item.name}</div>
                            <div class="admin-item-category">${CATEGORY_TRANSLATIONS[item.category] || item.category}</div>
                        </div>
                    </div>
                </td>
                <td><strong>฿${parseFloat(item.price).toFixed(2)}</strong></td>
                <td>${CATEGORY_TRANSLATIONS[item.category] || item.category}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${item.available ? "checked" : ""} onchange="toggleItemAvailability('${item.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="openMenuModal('${item.id}')">✏️ แก้ไข</button>
                        <button class="btn-delete" onclick="deleteMenuItem('${item.id}')">🗑️ ลบ</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch(err) {
        console.error("Menu fetch error:", err);
    }
}

async function toggleItemAvailability(id, checked) {
    try {
        await db.updateMenuItem(id, { available: checked });
    } catch(err) {
        alert("ไม่สามารถปรับสถานะได้: " + err.message);
        refreshAdminMenuTable();
    }
}

// Open Menu add/edit modal
function openMenuModal(itemId = null) {
    const modal = document.getElementById("menu-modal");
    const form = document.getElementById("menu-form");
    const titleEl = document.getElementById("menu-modal-title");
    const btnEl = document.getElementById("menu-form-btn");
    
    form.reset();
    document.getElementById("menu-item-id").value = "";
    
    if (itemId) {
        // Edit mode
        titleEl.innerText = "แก้ไขข้อมูลเมนูอาหาร";
        btnEl.innerText = "บันทึกการแก้ไข";
        
        const item = adminMenuItems.find(m => m.id === itemId);
        if (item) {
            document.getElementById("menu-item-id").value = item.id;
            document.getElementById("menu-item-name").value = item.name;
            document.getElementById("menu-item-price").value = item.price;
            document.getElementById("menu-item-category").value = item.category;
            document.getElementById("menu-item-desc").value = item.description || "";
            document.getElementById("menu-item-img").value = item.image_url || "";
        }
    } else {
        // Create mode
        titleEl.innerText = "เพิ่มรายการเมนูใหม่";
        btnEl.innerText = "เพิ่มรายการอาหาร";
    }
    
    if (modal) modal.classList.add("active");
}

function closeMenuModal() {
    const modal = document.getElementById("menu-modal");
    if (modal) modal.classList.remove("active");
}

async function saveMenuItem(e) {
    e.preventDefault();
    const id = document.getElementById("menu-item-id").value;
    const name = document.getElementById("menu-item-name").value;
    const price = parseFloat(document.getElementById("menu-item-price").value);
    const category = document.getElementById("menu-item-category").value;
    const description = document.getElementById("menu-item-desc").value;
    const image_url = document.getElementById("menu-item-img").value;
    
    const itemData = { name, price, category, description, image_url };
    
    try {
        if (id) {
            await db.updateMenuItem(id, itemData);
            alert("บันทึกการแก้ไขข้อมูลเมนูสำเร็จ!");
        } else {
            await db.addMenuItem(itemData);
            alert("เพิ่มรายการอาหารใหม่เรียบร้อย!");
        }
        closeMenuModal();
        refreshAdminMenuTable();
    } catch(err) {
        alert("ไม่สามารถบันทึกข้อมูลได้: " + err.message);
    }
}

async function deleteMenuItem(id) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเมนูอาหารนี้ออกจากระบบ?")) {
        try {
            await db.deleteMenuItem(id);
            alert("ลบข้อมูลเมนูอาหารเรียบร้อย!");
            refreshAdminMenuTable();
        } catch(err) {
            alert("ไม่สามารถลบข้อมูลได้: " + err.message);
        }
    }
}

// ==========================================
// 4. DATABASE & RESTAURANT SETTINGS
// ==========================================

function loadDbConfigUI() {
    const creds = db.getCredentials();
    document.getElementById("settings-db-url").value = creds.url;
    document.getElementById("settings-db-key").value = creds.anonKey;
    
    const statusBar = document.getElementById("db-status");
    const statusText = document.getElementById("db-status-text");
    
    if (db.isSupabase) {
        statusBar.className = "db-status-bar active";
        statusText.innerText = "เชื่อมต่อสำเร็จ: ระบบรันอยู่บนฐานข้อมูล Supabase PostgreSQL (คลาวด์)";
    } else {
        statusBar.className = "db-status-bar inactive";
        statusText.innerText = "ปิดการเชื่อมต่อ: ขณะนี้ระบบรันบนฐานข้อมูลสำรอง LocalStorage ในเครื่อง";
    }
}

function saveDbConfig(e) {
    e.preventDefault();
    const url = document.getElementById("settings-db-url").value.trim();
    const key = document.getElementById("settings-db-key").value.trim();
    
    const success = db.setSupabaseCredentials(url, key);
    if (success) {
        alert("เชื่อมต่อกับฐานข้อมูล Supabase เรียบร้อยแล้ว!");
    } else {
        alert("บันทึกข้อมูลสำเร็จ แต่ไม่สามารถเชื่อมต่อ Supabase ได้ กรุณาตรวจสอบข้อมูลและความถูกต้องของ URL/Key");
    }
    loadDbConfigUI();
}

function disconnectDb() {
    if (confirm("คุณต้องการตัดการเชื่อมต่อกับ Supabase และกลับมาใช้ LocalStorage ในบราวเซอร์หลักใช่หรือไม่?")) {
        db.setSupabaseCredentials("", "");
        alert("ระบบกลับมารันบน LocalStorage ฐานข้อมูลส่วนตัวเรียบร้อย");
        loadDbConfigUI();
    }
}

async function loadRestSettingsUI() {
    try {
        const settings = await db.getSettings();
        document.getElementById("settings-rest-name").value = settings.restaurantName;
        document.getElementById("settings-rest-address").value = settings.address;
        document.getElementById("settings-rest-phone").value = settings.phone;
        document.getElementById("settings-rest-sc").value = settings.serviceChargeRate;
        document.getElementById("settings-rest-tax").value = settings.taxRate;
        document.getElementById("settings-rest-footer").value = settings.receiptFooter;
    } catch(err) {
        console.error("Settings load error:", err);
    }
}

async function saveRestSettings(e) {
    e.preventDefault();
    const name = document.getElementById("settings-rest-name").value;
    const address = document.getElementById("settings-rest-address").value;
    const phone = document.getElementById("settings-rest-phone").value;
    const sc = parseFloat(document.getElementById("settings-rest-sc").value);
    const tax = parseFloat(document.getElementById("settings-rest-tax").value);
    const footer = document.getElementById("settings-rest-footer").value;
    
    try {
        await db.updateSettings({
            restaurantName: name,
            address: address,
            phone: phone,
            serviceChargeRate: sc,
            taxRate: tax,
            receiptFooter: footer
        });
        alert("บันทึกการตั้งค่าร้านค้าสำเร็จ!");
        loadRestSettingsUI();
        updateCartRates();
    } catch(err) {
        alert("ไม่สามารถบันทึกข้อมูลได้: " + err.message);
    }
}

// ==========================================
// 5. RECEIPT PRINT SERVICE (POS 80mm Layout) - THAI EDITION
// ==========================================

async function printReceipt(order) {
    const settings = await db.getSettings();
    const receiptContainer = document.getElementById("print-receipt-container");
    if (!receiptContainer) return;
    
    const formattedDate = new Date(order.created_at).toLocaleDateString('th-TH');
    const formattedTime = new Date(order.created_at).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'});
    
    let itemsMarkup = "";
    order.items.forEach(item => {
        const lineTotal = (item.price * item.quantity).toFixed(2);
        itemsMarkup += `
            <tr>
                <td>${item.name}<br>&nbsp;&nbsp;${item.quantity} x ฿${item.price.toFixed(2)}</td>
                <td class="num" valign="bottom">฿${lineTotal}</td>
            </tr>
        `;
    });
    
    receiptContainer.innerHTML = `
        <div class="receipt-header">
            <div class="receipt-title">${settings.restaurantName}</div>
            <div style="font-size: 12px; line-height: 1.3;">${settings.address}</div>
            <div style="font-size: 12px;">โทร: ${settings.phone}</div>
            <div class="receipt-divider"></div>
            <div class="receipt-title" style="font-size: 15px;">ใบเสร็จรับเงิน (RECEIPT)</div>
        </div>
        
        <div class="receipt-meta">
            <strong>เลขที่ออเดอร์:</strong> ${order.order_number}<br>
            <strong>วันที่:</strong> ${formattedDate} ${formattedTime}<br>
            <strong>ลูกค้า:</strong> ${order.customer_name}<br>
            <strong>จุดบริการ/โต๊ะ:</strong> ${order.table_number}
        </div>
        
        <div class="receipt-divider"></div>
        
        <table class="receipt-table">
            <thead>
                <tr>
                    <th>รายการอาหาร</th>
                    <th class="num">จำนวนเงิน</th>
                </tr>
            </thead>
            <tbody>
                ${itemsMarkup}
            </tbody>
        </table>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-summary">
            <div class="receipt-summary-row">
                <span>ยอดรวมหลัก:</span>
                <span>฿${parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div class="receipt-summary-row">
                <span>ค่าบริการ (Service Charge ${settings.serviceChargeRate}%):</span>
                <span>฿${parseFloat(order.service_charge).toFixed(2)}</span>
            </div>
            <div class="receipt-summary-row">
                <span>ภาษีมูลค่าเพิ่ม (VAT ${settings.taxRate}%):</span>
                <span>฿${parseFloat(order.tax).toFixed(2)}</span>
            </div>
            <div class="receipt-summary-row total">
                <span>ยอดเงินสุทธิ:</span>
                <span>฿${parseFloat(order.total).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-footer">
            ${settings.receiptFooter}<br>
            ระบบประมวลผลอัจฉริยะเดอะ เทสตี้ เพลท คลาวด์
        </div>
        
        <div class="receipt-barcode">
            <!-- Simulated thermal printer barcode lines -->
            <svg viewBox="0 0 100 20" width="120" height="24">
                <rect x="5" y="0" width="2" height="20" fill="black"/>
                <rect x="9" y="0" width="1" height="20" fill="black"/>
                <rect x="12" y="0" width="3" height="20" fill="black"/>
                <rect x="17" y="0" width="1" height="20" fill="black"/>
                <rect x="20" y="0" width="2" height="20" fill="black"/>
                <rect x="24" y="0" width="4" height="20" fill="black"/>
                <rect x="30" y="0" width="1" height="20" fill="black"/>
                <rect x="33" y="0" width="2" height="20" fill="black"/>
                <rect x="37" y="0" width="1" height="20" fill="black"/>
                <rect x="40" y="0" width="3" height="20" fill="black"/>
                <rect x="45" y="0" width="1" height="20" fill="black"/>
                <rect x="48" y="0" width="2" height="20" fill="black"/>
                <rect x="52" y="0" width="4" height="20" fill="black"/>
                <rect x="58" y="0" width="1" height="20" fill="black"/>
                <rect x="61" y="0" width="2" height="20" fill="black"/>
                <rect x="65" y="0" width="3" height="20" fill="black"/>
                <rect x="70" y="0" width="1" height="20" fill="black"/>
                <rect x="73" y="0" width="2" height="20" fill="black"/>
                <rect x="77" y="0" width="4" height="20" fill="black"/>
                <rect x="83" y="0" width="1" height="20" fill="black"/>
                <rect x="86" y="0" width="2" height="20" fill="black"/>
                <rect x="90" y="0" width="3" height="20" fill="black"/>
            </svg>
            <div class="receipt-barcode-line">${order.order_number}</div>
        </div>
    `;
    
    // Tiny delay to allow DOM generation before launching printer dialog
    setTimeout(() => {
        window.print();
    }, 100);
}
