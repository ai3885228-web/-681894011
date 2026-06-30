// ==========================================
// CUSTOMER-FACING ORDERING LOGIC
// ==========================================

let menuItems = [];
let cart = [];
let selectedCategory = "all";

// On page load, initialize the customer app
document.addEventListener("DOMContentLoaded", () => {
    // Check if we need to load user configuration or just start
    initApp();
    setupEventListeners();
});

async function initApp() {
    try {
        // Fetch menu items from Database
        menuItems = await db.getMenuItems();
        renderMenu();
        updateCartRates();
    } catch (e) {
        console.error("Initialization error:", e);
    }
}

function setupEventListeners() {
    // Category filtering
    const categoriesList = document.getElementById("categories-list");
    if (categoriesList) {
        categoriesList.addEventListener("click", (e) => {
            if (e.target.classList.contains("category-tab")) {
                // Remove active class from all tabs
                document.querySelectorAll(".category-tab").forEach(tab => tab.classList.remove("active"));
                
                // Add active class to clicked tab
                e.target.classList.add("active");
                
                // Filter menu
                selectedCategory = e.target.dataset.category;
                renderMenu();
            }
        });
    }
}

// Update tax/service charge rates in customer UI based on restaurant settings
async function updateCartRates() {
    try {
        const settings = await db.getSettings();
        const scRateEl = document.getElementById("summary-sc-rate");
        const taxRateEl = document.getElementById("summary-tax-rate");
        
        if (scRateEl) scRateEl.innerText = settings.serviceChargeRate;
        if (taxRateEl) taxRateEl.innerText = settings.taxRate;
    } catch(e) {
        console.error("Error updating cart rates:", e);
    }
}

// Render menu items into the grid
function renderMenu() {
    const grid = document.getElementById("food-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    const filteredItems = selectedCategory === "all" 
        ? menuItems 
        : menuItems.filter(item => item.category === selectedCategory);
        
    if (filteredItems.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No dishes found in this category.</div>`;
        return;
    }
    
    filteredItems.forEach(item => {
        const card = document.createElement("div");
        card.className = `food-card ${item.available ? "" : "unavailable"}`;
        
        const badge = item.available 
            ? `<span class="food-tag" style="color: var(--success); background: var(--success-light);">${item.category.toUpperCase()}</span>` 
            : `<span class="food-tag" style="color: var(--danger); background: var(--danger-light);">OUT OF STOCK</span>`;

        card.innerHTML = `
            <div class="food-img-container">
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}" class="food-img" alt="${item.name}">
                ${badge}
            </div>
            <div class="food-info">
                <h3 class="food-title">${item.name}</h3>
                <p class="food-desc">${item.description || 'No description available.'}</p>
                <div class="food-footer">
                    <span class="food-price">฿${parseFloat(item.price).toFixed(2)}</span>
                    <button class="btn-add-cart" onclick="addToCart('${item.id}')" ${item.available ? "" : "disabled"}>
                        +
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Add item to shopping cart
function addToCart(itemId) {
    const item = menuItems.find(m => m.id === itemId);
    if (!item || !item.available) return;
    
    const cartItemIndex = cart.findIndex(c => c.id === itemId);
    
    if (cartItemIndex > -1) {
        cart[cartItemIndex].quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: 1
        });
    }
    
    updateCartUI();
    
    // Tiny micro-animation for feedback
    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.style.transform = "scale(1.2)";
        setTimeout(() => badge.style.transform = "scale(1)", 150);
    }
}

// Adjust item quantity in cart
function changeQty(itemId, amount) {
    const itemIndex = cart.findIndex(c => c.id === itemId);
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += amount;
    
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }
    
    updateCartUI();
}

// Render dynamic cart UI and calculate rates
async function updateCartUI() {
    const container = document.getElementById("cart-items-list");
    const subtotalEl = document.getElementById("cart-subtotal");
    const serviceChargeEl = document.getElementById("cart-service-charge");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");
    const cartCountEl = document.getElementById("cart-count");
    const badgeMobile = document.getElementById("cart-badge-mobile");
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p>Your cart is empty.<br>Add some delicious dishes!</p>
            </div>
        `;
        subtotalEl.innerText = "฿0.00";
        serviceChargeEl.innerText = "฿0.00";
        taxEl.innerText = "฿0.00";
        totalEl.innerText = "฿0.00";
        cartCountEl.innerText = "0 items";
        if (badgeMobile) badgeMobile.innerText = "0";
        return;
    }
    
    container.innerHTML = "";
    
    let totalItems = 0;
    let subtotal = 0;
    
    cart.forEach(item => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;
        
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">฿${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="btn-qty-adj" onclick="changeQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty-adj" onclick="changeQty('${item.id}', 1)">+</button>
                </div>
            </div>
        `;
        container.appendChild(row);
    });
    
    // Load settings for tax and service charge
    const settings = await db.getSettings();
    const serviceCharge = parseFloat((subtotal * (settings.serviceChargeRate / 100)).toFixed(2));
    const taxableAmount = subtotal + serviceCharge;
    const tax = parseFloat((taxableAmount * (settings.taxRate / 100)).toFixed(2));
    const total = parseFloat((taxableAmount + tax).toFixed(2));
    
    cartCountEl.innerText = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
    if (badgeMobile) badgeMobile.innerText = totalItems;
    
    subtotalEl.innerText = `฿${subtotal.toFixed(2)}`;
    serviceChargeEl.innerText = `฿${serviceCharge.toFixed(2)}`;
    taxEl.innerText = `฿${tax.toFixed(2)}`;
    totalEl.innerText = `฿${total.toFixed(2)}`;
}

// Cart drawer for mobile
function toggleCartMobile() {
    const sidebar = document.getElementById("cart-sidebar");
    if (sidebar) {
        sidebar.classList.toggle("active");
        if (sidebar.classList.contains("active")) {
            sidebar.style.display = "flex";
            sidebar.style.position = "fixed";
            sidebar.style.top = "80px";
            sidebar.style.right = "0";
            sidebar.style.width = "100%";
            sidebar.style.height = "calc(100vh - 80px)";
            sidebar.style.zIndex = "99";
        } else {
            sidebar.style.display = "";
            sidebar.style.position = "";
            sidebar.style.top = "";
            sidebar.style.right = "";
            sidebar.style.width = "";
            sidebar.style.height = "";
            sidebar.style.zIndex = "";
        }
    }
}

// Checkout Form Modals
function openCheckoutModal() {
    if (cart.length === 0) {
        alert("Please add items to your cart first.");
        return;
    }
    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.add("active");
}

function closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    if (modal) modal.classList.remove("active");
}

// Submit Order action
async function submitOrder(e) {
    e.preventDefault();
    const customerName = document.getElementById("customer-name").value;
    const tableNumber = document.getElementById("table-number").value;
    
    if (!customerName || !tableNumber) {
        alert("Please complete the checkout fields.");
        return;
    }
    
    try {
        const orderData = {
            customer_name: customerName,
            table_number: tableNumber,
            items: cart
        };
        
        const createdOrder = await db.createOrder(orderData);
        alert(`Order Placed Successfully! Your Order Number is: ${createdOrder.order_number}`);
        
        // Reset cart
        cart = [];
        updateCartUI();
        closeCheckoutModal();
        
        // Reset form
        document.getElementById("checkout-form").reset();
        
        // Hide mobile cart if active
        const sidebar = document.getElementById("cart-sidebar");
        if (sidebar && sidebar.classList.contains("active")) {
            toggleCartMobile();
        }
        
    } catch(err) {
        console.error("Order error:", err);
        alert("There was an error sending your order. Please try again.");
    }
}

// Global router utility
function navigateTo(viewId) {
    document.querySelectorAll(".view-section").forEach(view => view.classList.remove("active"));
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.add("active");
        
        // Trigger specific init tasks per view
        if (viewId === 'admin-view') {
            initAdminPortal();
        } else if (viewId === 'customer-view') {
            initApp();
        }
    }
}
