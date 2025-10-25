// Simple frontend app (no build tools). Uses fetch to talk to backend.
// Expects backend at http://localhost:3001
const API = 'http://localhost:3001/api';
let state = { 
  user: null, 
  token: null, 
  products: [], 
  cart: {},
  appliedPromo: null, // { code, discountPercent }
  activePromos: [] // List of available promo codes
};

// Test backend connection on startup
async function testBackendConnection() {
  try {
    const res = await fetch(`${API}/products`);
    if (res.ok) {
      console.log('✅ Backend connection successful');
      return true;
    } else {
      console.error('❌ Backend returned status:', res.status);
      return false;
    }
  } catch (err) {
    console.error('❌ Cannot connect to backend:', err.message);
    console.error('Make sure backend is running on http://localhost:3001');
    alert('⚠️ Cannot connect to backend server. Please start the backend on port 3001.');
    return false;
  }
}

// Currency helpers
const inrFormatter = typeof Intl !== 'undefined'
  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : null;
function formatINR(value){
  const n = Number(value) || 0;
  return inrFormatter ? inrFormatter.format(n) : `₹${n.toFixed(2)}`;
}

function saveAuth(token, user){
  state.token = token; state.user = user;
  localStorage.setItem('mm_token', token);
  localStorage.setItem('mm_user', JSON.stringify(user));
  updateAuthUI();
}

function loadAuthFromStorage(){
  const t = localStorage.getItem('mm_token');
  const u = localStorage.getItem('mm_user');
  if(t && u){ state.token = t; state.user = JSON.parse(u); updateAuthUI(); }
}

function updateAuthUI(){
  const btnLogout = document.getElementById('btn-logout');
  const navProfile = document.getElementById('nav-profile');
  const offersNav = document.getElementById('offers-nav');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const cartCount = document.getElementById('cart-count');
  
  if (btnLogout) btnLogout.style.display = state.user ? 'inline-block' : 'none';
  if (navProfile) navProfile.style.display = state.user ? 'inline-block' : 'none';
  if (offersNav) offersNav.style.display = state.user ? 'flex' : 'none';
  if (navLogin) navLogin.style.display = state.user ? 'none' : 'inline-block';
  if (navRegister) navRegister.style.display = state.user ? 'none' : 'inline-block';
  if (cartCount) cartCount.innerText = Object.values(state.cart).reduce((s,i)=>s+i.qty,0) || 0;
}

async function fetchProducts(){
  try{
    console.log('Fetching products from:', API + '/products');
    const res = await fetch(API + '/products');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const products = await res.json();
    console.log('Products fetched successfully:', products.length, 'items');
    state.products = products;
    renderProducts();
  }catch(err){
    console.error('Error fetching products:', err);
    const productsEl = document.getElementById('products');
    if (productsEl) {
      productsEl.innerHTML = '<div class="error">Unable to fetch products. Backend error: ' + err.message + '</div>';
    }
  }
}

function renderProducts(){
  const el = document.getElementById('products');
  if (!el) return;
  
  el.innerHTML = state.products.map(p=>`
    <div class="card">
      <div class="img">
        ${p.images && p.images[0] ? `<img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.title)}">` : '<div class="no-image">No Image</div>'}
      </div>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description || '')}</p>
      <div class="price">₹${p.price}</div>
      <button class="btn-outline" data-id="${p._id}">Add to cart</button>
    </div>
  `).join('');
  // attach add to cart handlers
  el.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', ()=> addToCart(btn.getAttribute('data-id')));
  });
}

function addToCart(productId){
  const p = state.products.find(x=>x._id === productId);
  if(!p) return;
  if(!state.cart[productId]) state.cart[productId] = { product: p, qty: 0 };
  state.cart[productId].qty += 1;
  updateAuthUI();
  alert('Added to cart: ' + p.title + ' - ₹' + p.price);
}

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[s]); }

// Helpers
function showSection(id){
  const sections = ['section-home','section-shop','section-login','section-register','section-payment','section-profile','section-offers'];
  sections.forEach(s => {
    const element = document.getElementById(s);
    if (element) {
      element.style.display = (s === id) ? 'block' : 'none';
    }
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up event listeners...');
  
  // Navigation
  const navHome = document.getElementById('nav-home');
  const navShop = document.getElementById('nav-shop');
  const navProfile = document.getElementById('nav-profile');
  const navLogin = document.getElementById('nav-login');
  const navRegister = document.getElementById('nav-register');
  const startShop = document.getElementById('start-shop');
  
  if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); showSection('section-home'); });
  if (navShop) navShop.addEventListener('click', (e) => { e.preventDefault(); showSection('section-shop'); fetchProducts(); });
  if (navProfile) navProfile.addEventListener('click', (e) => { e.preventDefault(); showSection('section-profile'); loadProfile(); });
  
  // Combined offers navigation
  const offersNav = document.getElementById('offers-nav');
  if (offersNav) {
    console.log('✅ Found offers-nav element, adding click listener');
    offersNav.addEventListener('click', (e) => { 
      e.preventDefault(); 
      console.log('Offers clicked, navigating to offers section');
      showSection('section-offers');
      
      // Always load demo offers regardless of backend state
      setTimeout(() => {
        loadOffersSection();
      }, 100); // Small delay to ensure section is visible
    });
  } else {
    console.error('❌ offers-nav element not found');
  }
  
  if (navLogin) navLogin.addEventListener('click', (e) => { e.preventDefault(); showSection('section-login'); });
  if (navRegister) navRegister.addEventListener('click', (e) => { e.preventDefault(); showSection('section-register'); });
  if (startShop) startShop.addEventListener('click', () => { showSection('section-shop'); fetchProducts(); });

  // Cart modal handlers
  const btnCart = document.getElementById('btn-cart');
  const closeCartBtn = document.getElementById('close-cart');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (btnCart) btnCart.addEventListener('click', () => showCart());
  if (closeCartBtn) closeCartBtn.addEventListener('click', () => closeCart());
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => placeOrder());

  // Profile save button
  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => saveProfile());
  }

  // Make nav horizontally scrollable on small screens and add visual hint when overflow exists
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const checkScroll = () => {
      if (navLinks.scrollWidth > navLinks.clientWidth) {
        navLinks.classList.add('is-scrolling-right');
      } else {
        navLinks.classList.remove('is-scrolling-right');
      }
    };
    // initial check and on resize
    checkScroll();
    window.addEventListener('resize', checkScroll);
    navLinks.addEventListener('scroll', checkScroll);
  }

  // Registration Form
  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Registration form submitted');
      
      const nameEl = document.getElementById('reg-name');
      const emailEl = document.getElementById('reg-email');
      const passwordEl = document.getElementById('reg-password');
      const msgEl = document.getElementById('reg-msg');
      
      if (!nameEl || !emailEl || !passwordEl) {
        console.error('Registration form elements not found');
        return;
      }
      
      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const password = passwordEl.value.trim();
      
      if (msgEl) msgEl.innerText = '';
      
      if (!name || !email || !password) {
        if (msgEl) msgEl.innerText = 'Please fill in all fields';
        return;
      }
      
      try {
        console.log('Sending registration request...');
        const res = await fetch(API + '/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });
        
        console.log('Registration response status:', res.status);
        const data = await res.json();
        console.log('Registration response data:', data);
        
        if (!res.ok) {
          if (msgEl) msgEl.innerText = data.msg || data.error || 'Registration failed';
          return;
        }
        
        saveAuth(data.token, data.user);
        showSection('section-shop');
        fetchProducts();
        alert('Registration successful! Welcome to MarketMesh.');
      } catch (err) {
        console.error('Registration error:', err);
        if (msgEl) msgEl.innerText = 'Network error: ' + err.message;
      }
    });
  }

  // Login Form
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted');
      
      const emailEl = document.getElementById('login-email');
      const passwordEl = document.getElementById('login-password');
      const msgEl = document.getElementById('login-msg');
      
      if (!emailEl || !passwordEl) {
        console.error('Login form elements not found');
        return;
      }
      
      const email = emailEl.value.trim();
      const password = passwordEl.value.trim();
      
      if (msgEl) msgEl.innerText = '';
      
      if (!email || !password) {
        if (msgEl) msgEl.innerText = 'Please fill in all fields';
        return;
      }
      
      try {
        console.log('Sending login request...');
        const res = await fetch(API + '/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', res.status);
        const data = await res.json();
        console.log('Login response data:', data);
        
        if (!res.ok) {
          if (msgEl) msgEl.innerText = data.msg || data.error || 'Login failed';
          return;
        }
        
        saveAuth(data.token, data.user);
        showSection('section-shop');
        fetchProducts();
        alert('Login successful! Welcome back.');
      } catch (err) {
        console.error('Login error:', err);
        if (msgEl) msgEl.innerText = 'Network error: ' + err.message;
      }
    });
  }

  // Initialize the app
  loadAuthFromStorage();
  updateAuthUI();
  showSection('section-home');
  fetchProducts(); // Load products immediately
  
  console.log('App initialized successfully');
});

// Cart UI
function showCart(){
  const modal = document.getElementById('cart-modal');
  const items = document.getElementById('cart-items');
  if (!modal || !items) return;
  
  items.innerHTML = '';
  const arr = Object.values(state.cart);
  if(arr.length === 0) {
    items.innerHTML = '<p>Your cart is empty</p>';
  } else {
    arr.forEach(ci=>{
      const lineTotal = ci.product.price * ci.qty;
      const div = document.createElement('div');
      div.style.borderBottom = '1px solid #eee';
      div.style.padding = '8px 0';
      div.innerHTML = `<strong>${escapeHtml(ci.product.title)}</strong> x ${ci.qty} — ₹${lineTotal}
        <div style="margin-top:6px">
          <button class="btn-outline" data-id="${ci.product._id}" data-action="dec">-</button>
          <button class="btn-outline" data-id="${ci.product._id}" data-action="inc">+</button>
          <button class="btn-outline" data-id="${ci.product._id}" data-action="rem">Remove</button>
        </div>`;
      items.appendChild(div);
    });
  }
  
  // Update cart totals with promo discount
  updateCartDisplay();
  
  // attach handlers
  items.querySelectorAll('button[data-action]').forEach(b=>{
    b.addEventListener('click', ()=> {
      const id = b.getAttribute('data-id'); const a = b.getAttribute('data-action');
      if(a === 'inc') state.cart[id].qty += 1;
      if(a === 'dec') { state.cart[id].qty = Math.max(0, state.cart[id].qty - 1); if(state.cart[id].qty === 0) delete state.cart[id]; }
      if(a === 'rem') delete state.cart[id];
      showCart();
      updateAuthUI();
    });
  });
  modal.style.display = 'flex';
}

function closeCart(){
  const modal = document.getElementById('cart-modal');
  if (modal) modal.style.display = 'none';
}

async function placeOrder(){
  if(!state.user){ alert('Please login to place an order'); showSection('section-login'); return; }
  
  const items = Object.values(state.cart).map(ci=>({
    product: ci.product._id, title: ci.product.title, sku: ci.product.sku || '', qty: ci.qty, unitPrice: ci.product.price, totalPrice: ci.product.price * ci.qty
  }));
  
  const { subtotal, discount, total } = calculateCartTotal();
  
  const order = { 
    user: state.user.id, 
    items, 
    subtotal, 
    shipping: 0, 
    taxes: 0, 
    discount,
    promoCode: state.appliedPromo || undefined,
    total
  };
  
  try{
    const res = await fetch(API + '/orders', { 
      method:'POST', 
      headers:{
        'content-type':'application/json', 
        ...(state.token?{ 'authorization': 'Bearer '+state.token }: {})
      }, 
      body: JSON.stringify(order) 
    });
    
    const data = await res.json();
    if(!res.ok){ 
      const orderMsg = document.getElementById('order-msg');
      if (orderMsg) orderMsg.innerText = data.msg || 'Order failed'; 
      return; 
    }
    
    // If promo was applied, mark it as used
    if (state.appliedPromo) {
      try {
        await fetch(API + '/promos/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: state.appliedPromo.code })
        });
      } catch (err) {
        console.error('Error incrementing promo usage:', err);
      }
    }
    
    // Hide cart modal
    closeCart();
    // Show payment section
    showSection('section-payment');
    
    // Fill payment summary with order details
    const itemsHtml = items.map(item => `
      <div style="border-bottom: 1px solid #eee; padding: 5px 0;">
        ${item.title} x ${item.qty} - ₹${item.totalPrice}
      </div>
    `).join('');
    
    const discountHtml = discount > 0 ? `
      <div style="color: #28a745; font-weight: 600;">
        Discount (${state.appliedPromo.code} - ${state.appliedPromo.discountPercent}%): -₹${discount.toFixed(2)}
      </div>
    ` : '';
    
    const paymentSummary = document.getElementById('payment-summary');
    if (paymentSummary) {
      paymentSummary.innerHTML = `
        <div><strong>Order Summary</strong></div>
        <div>Order ID: <span style='color:green'>${data._id}</span></div>
        <div style="margin: 10px 0;">
          <strong>Items:</strong>
          ${itemsHtml}
        </div>
        <div><strong>Subtotal: ₹${subtotal.toFixed(2)}</strong></div>
        ${discountHtml}
        <div style="font-size: 1.15rem; margin-top: 8px;"><strong>Total: ₹${total.toFixed(2)}</strong></div>
      `;
    }
    
    // Store order id and details for payment
    state.lastOrderId = data._id;
    state.lastOrderTotal = total;
    state.cart = {}; 
    state.appliedPromo = null; // Clear promo after order
    updateAuthUI(); 
    renderProducts(); // clear cart
  }catch(err){
    const orderMsg = document.getElementById('order-msg');
    if (orderMsg) orderMsg.innerText = 'Network error placing order';
  }
}

// Payment method dynamic fields
function setupPaymentHandlers() {
  const radios = document.querySelectorAll('input[name="pay-method"]');
  radios.forEach(radio => {
    radio.addEventListener('change', function() {
      const container = document.getElementById('payment-details');
      if (!container) return;
      container.innerHTML = '';
      if (this.value === 'UPI') {
        container.innerHTML = `<label>UPI ID</label><input id='upi-id' placeholder='yourupi@bank' required>`;
      } else if (this.value === 'Card') {
        container.innerHTML = `
          <label>Card Number</label><input id='card-number' maxlength='16' placeholder='1234 5678 9012 3456' required>
          <label>Expiry</label><input id='card-expiry' maxlength='5' placeholder='MM/YY' required>
          <label>CVV</label><input id='card-cvv' maxlength='4' placeholder='123' required>
        `;
      }
    });
  });
}

// Payment handler
function submitPayment() {
  const address = document.getElementById('ship-address');
  const method = document.querySelector('input[name="pay-method"]:checked');
  if (!address || !method) {
    alert('Please enter address and select payment method.');
    return;
  }
  
  const addressValue = address.value;
  if (!addressValue || !method.value) {
    alert('Please enter address and select payment method.');
    return;
  }
  
  // Validate payment details
  if (method.value === 'UPI') {
    const upi = document.getElementById('upi-id');
    if (!upi || !upi.value || !/^[\w.-]+@[\w.-]+$/.test(upi.value)) {
      alert('Please enter a valid UPI ID.');
      return;
    }
  } else if (method.value === 'Card') {
    const cardNum = document.getElementById('card-number');
    const expiry = document.getElementById('card-expiry');
    const cvv = document.getElementById('card-cvv');
    if (!cardNum || !cardNum.value || !/^\d{16}$/.test(cardNum.value.replace(/\s+/g, ''))) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiry || !expiry.value || !/^\d{2}\/\d{2}$/.test(expiry.value)) {
      alert('Please enter expiry in MM/YY format.');
      return;
    }
    if (!cvv || !cvv.value || !/^\d{3,4}$/.test(cvv.value)) {
      alert('Please enter a valid CVV.');
      return;
    }
  }
  
  // Show confirmation
  const paymentSummary = document.getElementById('payment-summary');
  if (paymentSummary) {
    paymentSummary.innerHTML = `
      <div style='margin-top:16px;color:green;font-weight:bold'>
        ✅ Order has been placed!<br>
        Order ID: <b>${state.lastOrderId || ''}</b>
      </div>
      <div>Delivery to: ${escapeHtml(addressValue)}</div>
      <div>Payment Method: ${escapeHtml(method.value)}</div>
      <div style='margin-top:10px;color:#333;font-size:1.05em;'>
        Details will be sent to your email: <b>${state.user && state.user.email ? escapeHtml(state.user.email) : 'your email'}</b>
      </div>
      <div style='margin-top:18px;'>
        <button id='btn-order-home' class='btn-primary'>Go to Home</button>
      </div>
    `;
    const btnOrderHome = document.getElementById('btn-order-home');
    if (btnOrderHome) {
      btnOrderHome.onclick = function() {
        showSection('section-home');
      };
    }
  }
}

// Profile functionality
function loadProfile() {
  if (!state.user) return;
  
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profilePhoneInput = document.getElementById('profile-phone-input');
  const profileAddressInput = document.getElementById('profile-address-input');
  const profileDate = document.getElementById('profile-date');
  
  if (profileName) profileName.textContent = state.user.name || 'Not set';
  if (profileEmail) profileEmail.textContent = state.user.email || 'Not set';
  if (profilePhoneInput) profilePhoneInput.value = state.user.phone || '';
  if (profileAddressInput) profileAddressInput.value = state.user.address || '';
  
  let memberSince = 'Not set';
  if (state.user.createdAt) {
    try {
      memberSince = new Date(state.user.createdAt).toLocaleDateString();
    } catch(e) { memberSince = state.user.createdAt; }
  }
  if (profileDate) profileDate.textContent = memberSince;
  
  loadOrderHistory();
}

async function saveProfile() {
  const profilePhoneInput = document.getElementById('profile-phone-input');
  const profileAddressInput = document.getElementById('profile-address-input');
  const profileMsg = document.getElementById('profile-msg');
  
  if (!profilePhoneInput || !profileAddressInput || !profileMsg) {
    console.error('Profile elements not found');
    return;
  }
  
  const phone = profilePhoneInput.value.trim();
  const address = profileAddressInput.value.trim();
  
  console.log('Saving profile:', { phone, address });
  console.log('Using token:', state.token);
  
  profileMsg.textContent = 'Saving...';
  profileMsg.style.color = '#666';
  
  try {
    const res = await fetch(`${API}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ phone, address })
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const data = await res.json();
      console.error('Save failed:', data);
      profileMsg.textContent = data.msg || 'Failed to save';
      profileMsg.style.color = '#d33';
      return;
    }
    
    const updatedUser = await res.json();
    console.log('Updated user from API:', updatedUser);
    
    // Update state with ALL fields from the response
    state.user = {
      ...state.user,
      phone: updatedUser.phone,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt
    };
    
    console.log('Updated state.user:', state.user);
    localStorage.setItem('mm_user', JSON.stringify(state.user));
    console.log('Saved to localStorage');
    
    profileMsg.textContent = '✓ Profile updated successfully!';
    profileMsg.style.color = '#28a745';
    
    setTimeout(() => {
      profileMsg.textContent = '';
    }, 3000);
  } catch (err) {
    console.error('Save profile error:', err);
    profileMsg.textContent = 'Network error saving profile';
    profileMsg.style.color = '#d33';
  }
}

async function loadOrderHistory() {
  const orderHistoryDiv = document.getElementById('order-history');
  if (!orderHistoryDiv) {
    console.error('Order history div not found');
    return;
  }
  
  console.log('Loading order history...');
  console.log('Token:', state.token);
  console.log('API URL:', `${API}/orders/user`);
  
  orderHistoryDiv.innerHTML = '<p class="loading">Loading your orders...</p>';
  
  try {
    const res = await fetch(`${API}/orders/user`, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    
    console.log('Order history response status:', res.status);
    
    if (res.ok) {
      const orders = await res.json();
      console.log('Orders received:', orders.length, 'orders');
      console.log('Orders data:', orders);
      renderOrderHistory(orders);
    } else {
      const errorData = await res.json();
      console.error('Failed to load orders:', errorData);
      orderHistoryDiv.innerHTML = `<p style="color: #d33;">Failed to load orders: ${errorData.msg || 'Unknown error'}</p>`;
    }
  } catch (err) {
    console.error('Error loading order history:', err);
    orderHistoryDiv.innerHTML = '<p style="color: #d33;">Network error loading orders. Check console for details.</p>';
  }
}

function renderOrderHistory(orders) {
  const orderHistoryDiv = document.getElementById('order-history');
  if (!orderHistoryDiv) return;
  
  if (!orders || orders.length === 0) {
    orderHistoryDiv.innerHTML = '<p style="color: #666; text-align: center;">No orders yet. <a href="#" onclick="showSection(\'section-shop\'); fetchProducts();">Start shopping!</a></p>';
    return;
  }
  
  const orderHTML = orders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <div>
          <div class="order-id">Order #${order._id.slice(-8)}</div>
          <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
        </div>
        <div>
          <div class="order-total">${formatINR(order.total)}</div>
          <span class="order-status">${order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Completed'}</span>
        </div>
      </div>
      <div class="order-items">
        ${order.items.map(item => `<div>${item.qty}x ${item.title || item.name || 'Item'}</div>`).join('')}
      </div>
    </div>
  `).join('');
  
  orderHistoryDiv.innerHTML = orderHTML;
}

// Setup payment handlers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  setupPaymentHandlers();
});

// Navigation - with safety checks
function addNavEventListener(id, callback) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('click', callback);
  } else {
    console.warn('Navigation element not found:', id);
  }
}

addNavEventListener('nav-home', (e) => { e.preventDefault(); showSection('section-home'); });
addNavEventListener('nav-shop', (e) => { e.preventDefault(); showSection('section-shop'); fetchProducts(); });
addNavEventListener('nav-profile', (e) => { e.preventDefault(); showSection('section-profile'); loadProfile(); });
addNavEventListener('nav-login', (e) => { e.preventDefault(); showSection('section-login'); });
addNavEventListener('nav-register', (e) => { e.preventDefault(); showSection('section-register'); });
addNavEventListener('start-shop', () => { showSection('section-shop'); fetchProducts(); });

// Logout
// Centralized logout helper
function logout() {
  console.log('Logging out user...');
  // Clear front-end state
  state.user = null;
  state.token = null;
  state.cart = {};
  state.appliedPromo = null;

  // Remove persisted auth
  try {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
  } catch (e) {
    console.warn('LocalStorage clear failed during logout:', e);
  }

  // Update UI and hide protected sections
  updateAuthUI();
  try { updateOffersNavVisibility(); } catch (e) {}
  showSection('section-home');

  // Light-weight feedback
  alert('Logged out successfully');
}

// Attach logout handler (safe if element missing)
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', (e) => { e.preventDefault(); logout(); });
}

// Forms - with safety checks
const formRegister = document.getElementById('form-register');
if (formRegister) {
  formRegister.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('reg-msg');
    if (msg) msg.innerText = '';
    
    if (!name || !email || !password) {
      if (msg) msg.innerText = 'Please fill in all fields';
      return;
    }
    
    try{
      console.log('Sending registration request to:', API + '/auth/register');
      const res = await fetch(API + '/auth/register', { 
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          'Accept': 'application/json'
        }, 
        body: JSON.stringify({ name, email, password })
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if(!res.ok){ 
        if (msg) msg.innerText = data.msg || data.error || 'Registration failed'; 
        return; 
      }
      
      saveAuth(data.token, data.user);
      showSection('section-shop'); 
      fetchProducts();
      alert('Registration successful! Welcome to MarketMesh.');
    }catch(err){ 
      console.error('Register error:', err);
      if (msg) msg.innerText = 'Network error: ' + err.message; 
    }
  });
}

const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-msg');
    if (msg) msg.innerText = '';
    
    if (!email || !password) {
      if (msg) msg.innerText = 'Please fill in all fields';
      return;
    }
    
    try{
      console.log('Sending login request to:', API + '/auth/login');
      const res = await fetch(API + '/auth/login', { 
        method:'POST', 
        headers:{
          'Content-Type':'application/json',
          'Accept': 'application/json'
        }, 
        body: JSON.stringify({ email, password })
      });
      
      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if(!res.ok){ 
        if (msg) msg.innerText = data.msg || data.error || 'Login failed'; 
        return; 
      }
      
      saveAuth(data.token, data.user);
      showSection('section-shop'); 
      fetchProducts();
      alert('Login successful! Welcome back.');
    }catch(err){ 
      console.error('Login error:', err);
      if (msg) msg.innerText = 'Network error: ' + err.message; 
    }
  });
}

window.onload = ()=>{
  console.log('Page loaded, initializing...');
  debugElements();
  loadAuthFromStorage();
  updateAuthUI();
  // default show home
  showSection('section-home');
  // Load products for featured section
  fetchProducts();
  // Load active promo codes
  fetchActivePromos();
  // Pre-load offers section content
  loadOffersSection();
  // Test backend connectivity
  testBackendConnection();
  
  // Test offers section immediately for debugging
  setTimeout(() => {
    console.log('Testing offers section elements...');
    const offersSection = document.getElementById('section-offers');
    const promosList = document.getElementById('active-promos-list');
    console.log('section-offers element:', offersSection);
    console.log('active-promos-list element:', promosList);
  }, 1000);
  
  // Initialize promo code event listeners
  const notificationBell = document.getElementById('notification-bell');
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoInput = document.getElementById('promo-code-input');
  const browsePromosLink = document.getElementById('browse-promos-link');
  
  if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', applyPromoCode);
  }
  
  if (promoInput) {
    promoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyPromoCode();
      }
    });
  }
  
  if (browsePromosLink) {
    browsePromosLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeCart(); // Close cart modal
      showSection('section-offers');
      loadOffersSection();
    });
  }
  
  // Dropdown event listeners removed - using dedicated section
  
  // Initialize home category buttons after a brief delay
  setTimeout(() => {
    initializeHomeCategoryButtons();
  }, 500);
};

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    const res = await fetch(API + '/');
    const data = await res.json();
    console.log('Backend connection test successful:', data);
  } catch (err) {
    console.error('Backend connection test failed:', err);
  }
}

function initializeHomeCategoryButtons() {
  const categoryButtons = document.querySelectorAll('.home-products .btn-primary');
  console.log('Found category buttons:', categoryButtons.length);
  categoryButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      console.log('Category button clicked:', index);
      showSection('section-shop');
      fetchProducts();
    });
  });
}

function debugElements() {
  console.log('Checking essential elements:');
  const elements = [
    'nav-home', 'nav-shop', 'nav-profile', 'nav-login', 'nav-register',
    'form-login', 'form-register', 'products', 'start-shop',
    'section-home', 'section-shop', 'section-login', 'section-register', 'section-profile',
    'reg-msg', 'login-msg'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Missing element: ${id}`);
    } else {
      console.log(`✓ Found element: ${id}`);
    }
  });
}

// Payment method dynamic fields
document.querySelectorAll('input[name="pay-method"]').forEach(radio => {
  radio.addEventListener('change', function() {
    const container = document.getElementById('payment-details');
    container.innerHTML = '';
    if (this.value === 'UPI') {
      container.innerHTML = `<label>UPI ID</label><input id='upi-id' placeholder='yourupi@bank' required>`;
    } else if (this.value === 'Card') {
      container.innerHTML = `
        <label>Card Number</label><input id='card-number' maxlength='16' placeholder='1234 5678 9012 3456' required>
        <label>Expiry</label><input id='card-expiry' maxlength='5' placeholder='MM/YY' required>
        <label>CVV</label><input id='card-cvv' maxlength='4' placeholder='123' required>
      `;
    }
  });
});

// Payment handler
function submitPayment() {
  const address = document.getElementById('ship-address').value;
  const method = document.querySelector('input[name="pay-method"]:checked');
  if (!address || !method) {
    alert('Please enter address and select payment method.');
    return;
  }
  // Validate payment details
  if (method.value === 'UPI') {
    const upi = document.getElementById('upi-id')?.value;
    if (!upi || !/^[\w.-]+@[\w.-]+$/.test(upi)) {
      alert('Please enter a valid UPI ID.');
      return;
    }
  } else if (method.value === 'Card') {
    const cardNum = document.getElementById('card-number')?.value;
    const expiry = document.getElementById('card-expiry')?.value;
    const cvv = document.getElementById('card-cvv')?.value;
    if (!cardNum || !/^\d{16}$/.test(cardNum.replace(/\s+/g, ''))) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
      alert('Please enter expiry in MM/YY format.');
      return;
    }
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      alert('Please enter a valid CVV.');
      return;
    }
  }
  // Show confirmation
  document.getElementById('payment-summary').innerHTML = `
    <div style='margin-top:16px;color:green;font-weight:bold'>
      ✅ Order has been placed!<br>
      Order ID: <b>${state.lastOrderId || ''}</b>
    </div>
    <div>Delivery to: ${escapeHtml(address)}</div>
    <div>Payment Method: ${escapeHtml(method.value)}</div>
    <div style='margin-top:10px;color:#333;font-size:1.05em;'>
      Details will be sent to your email: <b>${state.user && state.user.email ? escapeHtml(state.user.email) : 'your email'}</b>
    </div>
    <div style='margin-top:18px;'>
      <button id='btn-order-home' class='btn-primary'>Go to Home</button>
    </div>
  `;
  document.getElementById('btn-order-home').onclick = function() {
    showSection('section-home');
  };
}

// ==================== PROMO CODE FUNCTIONALITY ====================

// Fetch active promo codes
async function fetchActivePromos() {
  try {
    console.log('Fetching active promos from:', `${API}/promos/active`);
    const res = await fetch(`${API}/promos/active`);
    if (res.ok) {
      state.activePromos = await res.json();
      console.log('Active promos loaded:', state.activePromos.length, state.activePromos);
      updateOffersNavVisibility();
      
      // Auto-load offers section if it's currently visible
      const offersSection = document.getElementById('section-offers');
      if (offersSection && offersSection.style.display !== 'none') {
        console.log('Offers section is visible, refreshing content');
        loadOffersSection();
      }
    } else {
      console.error('Failed to fetch promos, status:', res.status);
    }
  } catch (err) {
    console.error('Error fetching promos:', err);
  }
}

// Update offers nav visibility
function updateOffersNavVisibility() {
  console.log('Updating offers nav visibility');
  const offersNav = document.getElementById('offers-nav');
  
  // Show/hide offers nav based on login status
  if (offersNav && state.user) {
    offersNav.style.display = 'flex';
    console.log('Offers nav now visible for logged-in user');
  } else if (offersNav) {
    offersNav.style.display = 'none';
  }
}

// Dropdown functions removed - using dedicated section instead

// Apply promo code
async function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  const message = document.getElementById('promo-message');
  const code = input.value.trim().toUpperCase();
  
  if (!code) {
    message.textContent = 'Please enter a promo code';
    message.className = 'promo-message error';
    return;
  }
  
  message.textContent = 'Validating...';
  message.className = 'promo-message';
  
  // Demo promo codes for immediate validation
  const demoCodes = {
    'WELCOME5': { code: 'WELCOME5', discountPercent: 5, description: 'Welcome offer' },
    'SAVE10': { code: 'SAVE10', discountPercent: 10, description: 'Save 10% offer' },
    'FLASH15': { code: 'FLASH15', discountPercent: 15, description: 'Flash sale' },
    'MEGA20': { code: 'MEGA20', discountPercent: 20, description: 'Mega deal' }
  };
  
  // Check demo codes first
  if (demoCodes[code]) {
    const promo = demoCodes[code];
    state.appliedPromo = {
      code: promo.code,
      discountPercent: promo.discountPercent
    };
    
    message.textContent = `✅ ${promo.discountPercent}% discount applied!`;
    message.className = 'promo-message success';
    
    // Show applied promo display
    const appliedDisplay = document.getElementById('promo-applied-display');
    appliedDisplay.innerHTML = `
      <div class="promo-applied">
        <span class="promo-applied-code">🎉 ${promo.code} applied (${promo.discountPercent}% off)</span>
        <span class="promo-remove" onclick="removePromoCode()">Remove</span>
      </div>
    `;
    appliedDisplay.style.display = 'block';
    document.getElementById('promo-input-area').style.display = 'none';
    
    updateCartDisplay();
    return;
  }
  
  // Try backend validation for other codes
  try {
    const res = await fetch(`${API}/promos/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    const data = await res.json();
    
    if (res.ok && data.valid) {
      state.appliedPromo = {
        code: data.code,
        discountPercent: data.discountPercent
      };
      
      message.textContent = `✅ ${data.discountPercent}% discount applied!`;
      message.className = 'promo-message success';
      
      // Show applied promo display
      const appliedDisplay = document.getElementById('promo-applied-display');
      appliedDisplay.innerHTML = `
        <div class="promo-applied">
          <span class="promo-applied-code">🎉 ${data.code} applied (${data.discountPercent}% off)</span>
          <span class="promo-remove" onclick="removePromoCode()">Remove</span>
        </div>
      `;
      appliedDisplay.style.display = 'block';
      document.getElementById('promo-input-area').style.display = 'none';
      
      updateCartDisplay();
    } else {
      message.textContent = 'Invalid promo code. Try WELCOME5, SAVE10, FLASH15, or MEGA20';
      message.className = 'promo-message error';
      state.appliedPromo = null;
    }
  } catch (err) {
    console.error('Error applying promo:', err);
    message.textContent = 'Invalid promo code. Try WELCOME5, SAVE10, FLASH15, or MEGA20';
    message.className = 'promo-message error';
    state.appliedPromo = null;
  }
}

// Remove promo code
function removePromoCode() {
  state.appliedPromo = null;
  
  const appliedDisplay = document.getElementById('promo-applied-display');
  const inputArea = document.getElementById('promo-input-area');
  const message = document.getElementById('promo-message');
  const input = document.getElementById('promo-code-input');
  
  if (appliedDisplay) appliedDisplay.style.display = 'none';
  if (inputArea) inputArea.style.display = 'block';
  if (message) {
    message.textContent = '';
    message.className = 'promo-message';
  }
  if (input) input.value = '';
  
  updateCartDisplay();
}

// Calculate cart total with promo discount
function calculateCartTotal() {
  let subtotal = 0;
  for (let sku in state.cart) {
    const item = state.cart[sku];
    const itemPrice = item.product.price; // Use product.price, not unitPrice
    const itemTotal = item.qty * itemPrice;
    subtotal += itemTotal;
    console.log(`Item: ${item.product.title}, Qty: ${item.qty}, Price: ${itemPrice}, Total: ${itemTotal}`);
  }
  
  let discount = 0;
  if (state.appliedPromo) {
    discount = (subtotal * state.appliedPromo.discountPercent) / 100;
    console.log(`Applied promo: ${state.appliedPromo.code} (${state.appliedPromo.discountPercent}%)`);
    console.log(`Discount calculation: ${subtotal} * ${state.appliedPromo.discountPercent} / 100 = ${discount}`);
  }
  
  const total = subtotal - discount;
  
  console.log(`Final calculation: Subtotal: ${subtotal}, Discount: ${discount}, Total: ${total}`);
  
  return { subtotal, discount, total };
}

// Update cart display with discount
function updateCartDisplay() {
  const { subtotal, discount, total } = calculateCartTotal();
  
  console.log('Cart calculation:', { subtotal, discount, total, appliedPromo: state.appliedPromo });
  
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount');
  const discountRow = document.getElementById('discount-row');
  const discountPercent = document.getElementById('discount-percent');
  const totalEl = document.getElementById('cart-total');
  
  // Format numbers properly - just show the numeric value, the HTML already has ₹
  if (subtotalEl) {
    subtotalEl.textContent = subtotal.toFixed(2);
    console.log('Subtotal set to:', subtotal.toFixed(2));
  }
  if (totalEl) {
    totalEl.textContent = total.toFixed(2);
    console.log('Total set to:', total.toFixed(2));
  }
  
  if (state.appliedPromo && discount > 0) {
    if (discountEl) {
      discountEl.textContent = discount.toFixed(2);
      console.log('Discount set to:', discount.toFixed(2));
    }
    if (discountPercent) discountPercent.textContent = `${state.appliedPromo.discountPercent}%`;
    if (discountRow) discountRow.style.display = 'flex';
    console.log('Showing discount row');
  } else {
    if (discountRow) discountRow.style.display = 'none';
    console.log('Hiding discount row');
  }
}

// Load offers section - always show demo promo codes
function loadOffersSection() {
  console.log('=== loadOffersSection called ===');
  
  // First, make sure the section is visible
  const offersSection = document.getElementById('section-offers');
  if (offersSection) {
    console.log('✅ Found section-offers element');
  } else {
    console.error('❌ section-offers element not found!');
    return;
  }
  
  const promosList = document.getElementById('active-promos-list');
  const noPromosMsg = document.getElementById('no-promos-message');
  
  console.log('promosList element:', promosList);
  console.log('noPromosMsg element:', noPromosMsg);
  
  if (!promosList) {
    console.error('❌ active-promos-list element not found!');
    // Try to create it manually
    const offersContent = document.getElementById('offers-content');
    if (offersContent) {
      offersContent.innerHTML = `
        <div id="active-promos-list" style="display: grid; gap: 20px; margin-top: 20px;">
          <!-- Promo cards will be inserted here -->
        </div>
      `;
      console.log('Created active-promos-list manually');
    }
    return;
  }
  
  console.log('✅ Found active-promos-list element, proceeding with rendering');
  
  // Always show demo promo codes for now
  const demoPromos = [
    {
      code: 'WELCOME5',
      discountPercent: 5,
      description: 'Welcome offer! Get 5% off on your first purchase',
      daysLeft: 7
    },
    {
      code: 'SAVE10',
      discountPercent: 10,
      description: 'Limited time offer! Save 10% on all products',
      daysLeft: 3
    },
    {
      code: 'FLASH15',
      discountPercent: 15,
      description: 'Flash sale! Get 15% off - Hurry, expires soon!',
      daysLeft: 1
    },
    {
      code: 'MEGA20',
      discountPercent: 20,
      description: 'Mega deal! Save big with 20% discount on electronics',
      daysLeft: 5
    }
  ];
  
  console.log('Rendering', demoPromos.length, 'demo promo cards');
  if (noPromosMsg) noPromosMsg.style.display = 'none';
  
  promosList.style.display = 'grid';
  promosList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  promosList.style.gap = '20px';
  promosList.style.marginTop = '20px';
  
  const cardsHtml = demoPromos.map(promo => {
    const expiryText = promo.daysLeft <= 0 ? 'Expires today!' : 
                      promo.daysLeft === 1 ? 'Expires tomorrow!' :
                      `Expires in ${promo.daysLeft} days`;
    
    return `
      <div class="promo-card" style="background: white; border: 1px solid #ddd; border-radius: 12px; padding: 20px;">
        <div class="promo-card-header">
          <div>
            <span class="promo-card-code" style="background: linear-gradient(135deg, #ff7a00, #ff9933); color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold;">${promo.code}</span>
            <span class="promo-card-discount" style="color: #ff7a00; font-weight: bold; font-size: 1.2rem; margin-left: 10px;">${promo.discountPercent}% OFF</span>
          </div>
        </div>
        <div class="promo-card-description" style="color: #666; margin: 12px 0;">${promo.description}</div>
        <div class="promo-card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 1px solid #eee; padding-top: 12px;">
          <div class="promo-card-expiry" style="color: #666; font-size: 0.9rem;">⏰ ${expiryText}</div>
          <button class="promo-copy-btn" onclick="copyPromoCodeToCart('${promo.code}')" style="background: #ff7a00; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Copy to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  promosList.innerHTML = cardsHtml;
  console.log('✅ Successfully rendered', demoPromos.length, 'demo promo cards');
  console.log('Final HTML:', cardsHtml.substring(0, 200) + '...');
}

// Copy promo code to cart and switch to cart
function copyPromoCodeToCart(code) {
  const input = document.getElementById('promo-code-input');
  if (input) {
    input.value = code;
    showCart();
    
    // Auto-apply after a brief delay
    setTimeout(() => {
      const applyBtn = document.getElementById('apply-promo-btn');
      if (applyBtn) applyBtn.click();
    }, 300);
  }
}
