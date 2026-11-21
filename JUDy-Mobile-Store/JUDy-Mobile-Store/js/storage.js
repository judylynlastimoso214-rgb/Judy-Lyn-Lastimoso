/* ============================================================
   storage.js - LocalStorage helpers, sample data, shared layout
   Loaded on every page.
   ============================================================ */

// Keys used in LocalStorage
const KEYS = {
  users: 'judy_users',
  products: 'judy_products',
  cart: 'judy_cart',
  orders: 'judy_orders',
  admin: 'judy_admin',
  settings: 'judy_settings',
  session: 'judy_session'
};

// ---------- Basic read / write ----------
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}
function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const getProducts = () => loadData(KEYS.products, []);
const saveProducts = (list) => saveData(KEYS.products, list);
const getUsers = () => loadData(KEYS.users, []);
const saveUsers = (list) => saveData(KEYS.users, list);
const getOrders = () => loadData(KEYS.orders, []);
const saveOrders = (list) => saveData(KEYS.orders, list);
const getCart = () => loadData(KEYS.cart, []);
const saveCart = (list) => saveData(KEYS.cart, list);
const getSettings = () => loadData(KEYS.settings, {});
const getProduct = (id) => getProducts().find((p) => p.id === Number(id));

// ---------- Sample data (created only the first time) ----------
function makeProduct(id, name, brand, category, price, discount, ram, storage, processor,
                     mainCamera, frontCamera, battery, display, os, colors, stock,
                     popularity, color, daysAgo, description) {
  return {
    id, name, brand, category, price, discount, ram, storage, processor,
    mainCamera, frontCamera, battery, display, os, colors, stock, popularity,
    color,            // phone color used by the generated product image
    image: '',        // optional uploaded image (admin)
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    description
  };
}

function createSampleProducts() {
  return [
    makeProduct(1, 'iPhone 15', 'Apple', 'Flagship', 45000, 5, '6GB', '128GB', 'Apple A16 Bionic', '48MP + 12MP dual camera', '12MP TrueDepth', '3349 mAh', '6.1" Super Retina XDR OLED', 'iOS 17', ['Black', 'Blue', 'Pink'], 15, 950, '#4a5d7e', 4, 'The iPhone 15 brings the Dynamic Island, a 48MP main camera and USB-C in a lightweight aluminum design.'),
    makeProduct(2, 'iPhone 14', 'Apple', 'Flagship', 38990, 10, '6GB', '128GB', 'Apple A15 Bionic', '12MP dual camera', '12MP TrueDepth', '3279 mAh', '6.1" Super Retina XDR OLED', 'iOS 16', ['Midnight', 'Purple', 'Red'], 10, 700, '#6b5b95', 60, 'A reliable iPhone with a great camera system, crash detection and all-day battery life.'),
    makeProduct(3, 'Galaxy S24', 'Samsung', 'Flagship', 39999, 8, '8GB', '256GB', 'Exynos 2400', '50MP + 12MP + 10MP triple camera', '12MP', '4000 mAh', '6.2" Dynamic AMOLED 2X, 120Hz', 'Android 14 (One UI 6.1)', ['Onyx Black', 'Marble Gray', 'Amber Yellow'], 8, 880, '#d4a537', 8, 'Samsung\'s compact flagship with Galaxy AI features, a bright 120Hz display and a pro-grade camera.'),
    makeProduct(4, 'Galaxy A55 5G', 'Samsung', 'Mid-range', 24990, 12, '8GB', '256GB', 'Exynos 1480', '50MP triple camera', '32MP', '5000 mAh', '6.6" Super AMOLED, 120Hz', 'Android 14 (One UI 6.1)', ['Awesome Iceblue', 'Awesome Navy'], 20, 760, '#5aa9e6', 25, 'A premium mid-ranger with a metal frame, water resistance and a smooth AMOLED screen.'),
    makeProduct(5, 'Redmi Note 13', 'Xiaomi', 'Budget', 12999, 0, '8GB', '128GB', 'Snapdragon 685', '108MP triple camera', '16MP', '5000 mAh', '6.67" AMOLED, 120Hz', 'Android 13 (MIUI 14)', ['Midnight Black', 'Ocean Teal', 'Arctic White'], 3, 990, '#1fa89a', 30, 'The best-selling budget phone with a 108MP camera and a vivid AMOLED display.'),
    makeProduct(6, 'Xiaomi 14', 'Xiaomi', 'Flagship', 49990, 6, '12GB', '512GB', 'Snapdragon 8 Gen 3', '50MP Leica triple camera', '32MP', '4610 mAh', '6.36" LTPO AMOLED, 120Hz', 'Android 14 (HyperOS)', ['Black', 'White', 'Jade Green'], 6, 540, '#2e8b57', 14, 'A compact powerhouse with Leica optics and the latest Snapdragon processor.'),
    makeProduct(7, 'Reno11 5G', 'Oppo', 'Mid-range', 28999, 10, '8GB', '256GB', 'Dimensity 7050', '50MP triple camera', '32MP', '5000 mAh', '6.7" AMOLED, 120Hz', 'Android 14 (ColorOS 14)', ['Wave Green', 'Rock Grey'], 12, 610, '#3cb371', 12, 'A portrait-focused phone with a curved display, fast charging and a stylish design.'),
    makeProduct(8, 'V30', 'Vivo', 'Mid-range', 27999, 8, '12GB', '256GB', 'Snapdragon 7 Gen 3', '50MP + 50MP camera', '50MP', '5000 mAh', '6.78" AMOLED, 120Hz', 'Android 14 (Funtouch OS 14)', ['Peacock Green', 'Classic Black'], 9, 650, '#2f6f73', 18, 'Studio-quality portraits with an aura light and a slim curved-screen design.'),
    makeProduct(9, '12 Pro+ 5G', 'Realme', 'Mid-range', 25999, 15, '8GB', '256GB', 'Snapdragon 7s Gen 2', '50MP periscope camera', '32MP', '5000 mAh', '6.7" OLED, 120Hz', 'Android 14 (Realme UI 5)', ['Submarine Blue', 'Navigator Beige'], 14, 720, '#c9a46a', 6, 'A luxury-watch inspired design with a periscope zoom camera at a friendly price.'),
    makeProduct(10, '12', 'OnePlus', 'Flagship', 47990, 5, '12GB', '256GB', 'Snapdragon 8 Gen 3', '50MP Hasselblad triple camera', '32MP', '5400 mAh', '6.82" LTPO AMOLED, 120Hz', 'Android 14 (OxygenOS 14)', ['Flowy Emerald', 'Silky Black'], 7, 580, '#0f5132', 2, 'Flagship speed, a huge battery and 100W fast charging.'),
    makeProduct(11, 'Note 40 Pro', 'Infinix', 'Budget', 11999, 10, '8GB', '256GB', 'Helio G99 Ultimate', '108MP camera', '32MP', '5000 mAh', '6.78" AMOLED, 120Hz', 'Android 14 (XOS 14)', ['Vintage Green', 'Titan Gold'], 25, 680, '#7a9e7e', 1, 'A value-packed phone with wireless charging support and a big AMOLED display.'),
    makeProduct(12, 'Camon 30', 'Tecno', 'Budget', 14999, 10, '12GB', '256GB', 'Helio G99 Ultimate', '50MP OIS camera', '50MP', '5000 mAh', '6.78" AMOLED, 120Hz', 'Android 14 (HiOS 14)', ['Basalt Dark', 'Uyuni Blue'], 0, 400, '#b0b7c3', 3, 'A camera-focused phone with OIS and a high-resolution selfie camera. Currently sold out.')
  ];
}

function initStorage() {
  if (!localStorage.getItem(KEYS.products)) saveProducts(createSampleProducts());
  if (!localStorage.getItem(KEYS.users)) saveUsers([]);
  if (!localStorage.getItem(KEYS.orders)) saveOrders([]);
  if (!localStorage.getItem(KEYS.cart)) saveCart([]);
  if (!localStorage.getItem(KEYS.admin)) {
    saveData(KEYS.admin, { name: 'Administrator', username: 'admin', password: 'admin123' });
  }
  if (!localStorage.getItem(KEYS.settings)) {
    saveData(KEYS.settings, { storeName: 'JUDy Mobile Store', shippingFee: 150, freeShippingOver: 40000, lowStockLimit: 5 });
  }
}
initStorage();

// ---------- Small helper functions ----------
function peso(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH');
}
function salePrice(product) {
  return Math.round(product.price * (1 - product.discount / 100));
}
function getStockStatus(product) {
  if (product.stock <= 0) return 'Out of Stock';
  if (product.stock <= getSettings().lowStockLimit) return 'Low Stock';
  return 'Available';
}
function stockClass(product) {
  const status = getStockStatus(product);
  return status === 'Available' ? 'in' : status === 'Low Stock' ? 'low' : 'out';
}
function statusBadge(status) {
  return `<span class="status status-${status.toLowerCase()}">${status}</span>`;
}
// Escape text so user input cannot break the HTML
function esc(text) {
  return String(text == null ? '' : text).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
function toast(message, type) {
  const box = document.createElement('div');
  box.className = 'toast ' + (type || 'success');
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}

// ---------- Product images (drawn with SVG, no image files needed) ----------
function phoneImage(color, view) {
  let shape;
  if (view === 'back') {
    shape = `<rect x="70" y="14" width="110" height="232" rx="22" fill="${color}"/>
      <rect x="82" y="28" width="52" height="56" rx="14" fill="#111" opacity=".85"/>
      <circle cx="99" cy="45" r="9" fill="#444"/><circle cx="117" cy="66" r="9" fill="#444"/>
      <circle cx="150" cy="40" r="5" fill="#ffd54f"/>`;
  } else if (view === 'side') {
    shape = `<rect x="112" y="14" width="26" height="232" rx="12" fill="${color}"/>
      <rect x="112" y="14" width="9" height="232" rx="4" fill="#000" opacity=".25"/>`;
  } else {
    shape = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient></defs>
      <rect x="70" y="14" width="110" height="232" rx="22" fill="#111"/>
      <rect x="76" y="20" width="98" height="220" rx="17" fill="url(#g)"/>
      <rect x="110" y="26" width="30" height="8" rx="4" fill="#000"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 260">${shape}</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function getImages(product) {
  if (product.image) return [product.image];
  return [phoneImage(product.color, 'front'), phoneImage(product.color, 'back'), phoneImage(product.color, 'side')];
}

// ---------- Login session ----------
const getSession = () => loadData(KEYS.session, null);
function getCurrentUser() {
  const session = getSession();
  if (!session || session.role !== 'user') return null;
  const user = getUsers().find((u) => u.username === session.username);
  return user && user.active !== false ? user : null;
}
function logout() {
  localStorage.removeItem(KEYS.session);
  window.location.href = 'index.html';
}

// ---------- Cart badge ----------
function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = getCart().reduce((sum, item) => sum + item.qty, 0);
}

// ---------- Shared header and footer ----------
function renderLayout() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const session = getSession();
  const user = getCurrentUser();
  let authHtml;
  if (session && session.role === 'admin') {
    authHtml = `<a class="btn btn-sm" href="admin.html">Admin</a>
                <button class="btn btn-sm btn-outline-light" onclick="logout()">Logout</button>`;
  } else if (user) {
    authHtml = `<a class="user-link" href="profile.html">👤 ${esc(user.username)}</a>
                <a class="user-link" href="orders.html">My Orders</a>
                <button class="btn btn-sm btn-outline-light" onclick="logout()">Logout</button>`;
  } else {
    authHtml = `<a class="btn btn-sm btn-outline-light" href="login.html">Login</a>
                <a class="btn btn-sm" href="register.html">Register</a>`;
  }
  const active = (file) => (page === file ? 'active' : '');

  document.getElementById('site-header').innerHTML = `
  <div class="topbar">🚚 Free shipping on orders ₱40,000 and above &nbsp;·&nbsp; 📞 +63 912 345 6789</div>
  <header class="navbar">
    <div class="container nav-main">
      <a class="logo" href="index.html"><img src="images/logo/logo.svg" alt="logo"><span class="logo-text">JUDy<small>Mobile Store</small></span></a>
      <form class="nav-search" action="products.html" method="get">
        <input type="search" name="search" placeholder="Search smartphones or brands..." value="${esc(getParam('search') || '')}">
        <button type="submit">Search</button>
      </form>
      <div class="nav-right">
        <a class="cart-link" href="cart.html" title="Shopping cart">🛒<span class="cart-count" id="cartCount">0</span></a>
        ${authHtml}
      </div>
      <button class="menu-btn" onclick="document.getElementById('navLinks').classList.toggle('open')">☰</button>
    </div>
    <nav class="nav-bar"><div class="container">
      <ul class="nav-links" id="navLinks">
        <li><a class="${active('index.html')}" href="index.html">Home</a></li>
        <li><a class="${active('products.html')}" href="products.html">Products</a></li>
        <li><a href="index.html#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div></nav>
  </header>`;

  document.getElementById('site-footer').innerHTML = `
  <footer class="footer" id="contact"><div class="container footer-grid">
    <div><h3>JUDy Mobile Store</h3><p>Your trusted online store for the latest smartphones at affordable prices.</p></div>
    <div><h4>Contact Us</h4>
      <p>📧 support@judymobile.com</p><p>📞 +63 912 345 6789</p><p>📍 123 Rizal Street, Cebu City, Philippines</p></div>
    <div><h4>Follow Us</h4>
      <p><a href="#">Facebook</a></p><p><a href="#">Instagram</a></p><p><a href="#">TikTok</a></p></div>
    <div><h4>Quick Links</h4>
      <p><a href="products.html">Products</a></p><p><a href="cart.html">Cart</a></p><p><a href="admin.html">Admin</a></p></div>
  </div>
  <div class="copyright">&copy; 2026 JUDy Mobile Store. All rights reserved.</div></footer>`;
  updateCartBadge();
}
document.addEventListener('DOMContentLoaded', renderLayout);
