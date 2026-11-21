/* ============================================================
   admin.js - admin dashboard (products, orders, customers,
   inventory and sales report). Login: admin / admin123
   ============================================================ */

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
let pendingImage = '';   // image chosen in the product form

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('adminApp');
  if (!app) return;
  const session = getSession();
  if (!session || session.role !== 'admin') {
    document.getElementById('adminGuard').innerHTML =
      '<div class="empty"><h2>Admin access only</h2><p>Please login with the admin account.</p><a class="btn" href="login.html">Go to Login</a></div>';
    return;
  }
  app.hidden = false;
  document.querySelectorAll('[data-section]').forEach((btn) =>
    btn.addEventListener('click', () => showSection(btn.dataset.section)));
  document.getElementById('prodSearch').addEventListener('input', renderProducts);
  document.getElementById('orderSearch').addEventListener('input', renderOrders);
  showSection('dashboard');
});

function showSection(name) {
  document.querySelectorAll('.admin-section').forEach((s) => (s.hidden = s.id !== 'sec-' + name));
  document.querySelectorAll('[data-section]').forEach((b) => b.classList.toggle('active', b.dataset.section === name));
  const renderers = { dashboard: renderDashboard, products: renderProducts, orders: renderOrders,
    customers: renderCustomers, inventory: renderInventory, sales: renderSales };
  renderers[name]();
  window.currentSection = name;
}
const refreshSection = () => showSection(window.currentSection);

function statCards(list) {
  return list.map((c) => `<div class="stat-card"><div class="stat-icon">${c[0]}</div><div><p>${c[1]}</p><h3>${c[2]}</h3></div></div>`).join('');
}

// ---------- Dashboard ----------
function renderDashboard() {
  const products = getProducts(), orders = getOrders();
  // Total sales = all orders that are not cancelled
  const sales = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  document.getElementById('statCards').innerHTML = statCards([
    ['📱', 'Total Products', products.length],
    ['🧾', 'Total Orders', orders.length],
    ['👥', 'Total Customers', getUsers().length],
    ['💰', 'Total Sales', peso(sales)],
    ['⏳', 'Pending Orders', orders.filter((o) => o.status === 'Pending').length],
    ['✅', 'Completed Orders', orders.filter((o) => o.status === 'Delivered').length],
    ['⚠️', 'Low Stock Products', products.filter((p) => getStockStatus(p) === 'Low Stock').length]
  ]);
}

// ---------- Products ----------
function renderProducts() {
  const keyword = document.getElementById('prodSearch').value.trim().toLowerCase();
  const list = getProducts().filter((p) => (p.name + ' ' + p.brand + ' ' + p.category).toLowerCase().includes(keyword));
  document.getElementById('prodBody').innerHTML = list.map((p) => `
    <tr>
      <td><div class="cell-product"><img src="${getImages(p)[0]}" alt=""><div><strong>${esc(p.name)}</strong><br><small>${esc(p.category)}</small></div></div></td>
      <td>${esc(p.brand)}</td><td>${peso(p.price)}</td><td>${p.discount}%</td><td>${p.stock}</td>
      <td class="actions"><button class="btn btn-sm" onclick="openProductForm(${p.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="6">No products found.</td></tr>';
}

function openModal(html) {
  document.getElementById('modalBox').innerHTML = html;
  document.getElementById('modal').classList.add('open');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }

function openProductForm(id) {
  const p = id ? getProduct(id) : { name: '', brand: '', category: 'Mid-range', price: '', discount: 0, ram: '', storage: '',
    processor: '', mainCamera: '', frontCamera: '', battery: '', display: '', os: 'Android 14', colors: [], stock: 0, description: '', color: '#3b6fd4', image: '' };
  pendingImage = p.image || '';
  const field = (fid, label, value, type) => `<label>${label}<input id="${fid}" type="${type || 'text'}" value="${esc(value)}"></label>`;
  const brands = [...new Set(getProducts().map((x) => x.brand))];
  openModal(`
    <h2>${id ? 'Edit Product' : 'Add Product'}</h2>
    <div id="pfError" class="alert error"></div>
    <div class="form-grid">
      ${field('pName', 'Product Name', p.name)}
      <label>Brand<input id="pBrand" list="brandList" value="${esc(p.brand)}"><datalist id="brandList">${brands.map((b) => `<option value="${esc(b)}">`).join('')}</datalist></label>
      <label>Category<select id="pCategory">${['Flagship', 'Mid-range', 'Budget'].map((c) => `<option ${c === p.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
      ${field('pPrice', 'Price (₱)', p.price, 'number')}
      ${field('pDiscount', 'Discount (%)', p.discount, 'number')}
      ${field('pStock', 'Stock', p.stock, 'number')}
      ${field('pRam', 'RAM', p.ram)}${field('pStorage', 'Storage', p.storage)}
      ${field('pProcessor', 'Processor', p.processor)}${field('pMainCamera', 'Main Camera', p.mainCamera)}
      ${field('pFrontCamera', 'Front Camera', p.frontCamera)}${field('pBattery', 'Battery', p.battery)}
      ${field('pDisplay', 'Display', p.display)}${field('pOs', 'Operating System', p.os)}
      ${field('pColors', 'Colors (comma separated)', p.colors.join(', '))}
      ${field('pColor', 'Phone color (for generated image)', p.color, 'color')}
    </div>
    <label>Description<textarea id="pDescription" rows="3">${esc(p.description)}</textarea></label>
    <label>Product Image (optional)<input type="file" id="pImage" accept="image/*" onchange="handleImageUpload(this)"></label>
    <img id="imgPreview" class="img-preview" src="${p.image || ''}" alt="" ${p.image ? '' : 'hidden'}>
    <div class="modal-actions"><button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn" onclick="saveProduct(${id || 0})">${id ? 'Update Product' : 'Add Product'}</button></div>`);
}

// Shrinks the uploaded image so it fits in LocalStorage
function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 500 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      pendingImage = canvas.toDataURL('image/jpeg', 0.8);
      const preview = document.getElementById('imgPreview');
      preview.src = pendingImage;
      preview.hidden = false;
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function saveProduct(id) {
  const v = (fid) => document.getElementById(fid).value.trim();
  const price = Number(v('pPrice')), discount = Number(v('pDiscount') || 0), stock = Number(v('pStock'));
  let error = '';
  if (!v('pName') || !v('pBrand')) error = 'Product name and brand are required.';
  else if (!(price > 0)) error = 'Price must be greater than 0.';
  else if (discount < 0 || discount > 90) error = 'Discount must be between 0 and 90.';
  else if (!Number.isInteger(stock) || stock < 0) error = 'Stock must be a whole number (0 or more).';
  if (error) { const box = document.getElementById('pfError'); box.textContent = error; box.style.display = 'block'; return; }

  const products = getProducts();
  const data = {
    name: v('pName'), brand: v('pBrand'), category: v('pCategory'), price, discount, stock,
    ram: v('pRam'), storage: v('pStorage'), processor: v('pProcessor'), mainCamera: v('pMainCamera'),
    frontCamera: v('pFrontCamera'), battery: v('pBattery'), display: v('pDisplay'), os: v('pOs'),
    colors: v('pColors').split(',').map((c) => c.trim()).filter(Boolean),
    color: v('pColor'), description: v('pDescription'), image: pendingImage
  };
  if (id) {
    Object.assign(products.find((p) => p.id === id), data);
  } else {
    const newId = products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    products.push({ id: newId, popularity: 0, createdAt: new Date().toISOString(), ...data });
  }
  saveProducts(products);
  closeModal();
  refreshSection();
  toast(id ? 'Product updated' : 'Product added');
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  saveProducts(getProducts().filter((p) => p.id !== id));
  saveCart(getCart().filter((i) => i.id !== id));
  refreshSection();
  toast('Product deleted');
}

// ---------- Orders ----------
function renderOrders() {
  const keyword = document.getElementById('orderSearch').value.trim().toLowerCase();
  const list = getOrders().slice().reverse().filter((o) => (o.id + ' ' + o.customer.name).toLowerCase().includes(keyword));
  document.getElementById('orderBody').innerHTML = list.map((o) => {
    const index = ORDER_STATUSES.indexOf(o.status);
    const locked = o.status === 'Delivered' || o.status === 'Cancelled';
    // Admin can only move an order forward (or cancel it)
    const options = ORDER_STATUSES.filter((s, i) => i >= index);
    return `<tr>
      <td><strong>${esc(o.id)}</strong></td><td>${esc(o.customer.name)}</td>
      <td>${new Date(o.date).toLocaleDateString('en-PH')}</td><td>${peso(o.total)}</td><td>${esc(o.payment)}</td>
      <td><select onchange="updateOrderStatus('${o.id}', this.value)" ${locked ? 'disabled' : ''}>
        ${options.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
      <td><button class="btn btn-sm" onclick="viewOrder('${o.id}')">View</button></td></tr>`;
  }).join('') || '<tr><td colspan="7">No orders found.</td></tr>';
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (status === 'Cancelled') {
    if (!confirm('Cancel this order? The stock will be returned.')) { renderOrders(); return; }
    const products = getProducts();
    order.items.forEach((item) => { const p = products.find((x) => x.id === item.id); if (p) p.stock += item.qty; });
    saveProducts(products);
  }
  order.status = status;
  saveOrders(orders);   // customers see the new status in their order history
  refreshSection();
  toast('Order ' + orderId + ' is now ' + status);
}

function viewOrder(orderId) {
  const o = getOrders().find((x) => x.id === orderId);
  openModal(`
    <h2>Order #${esc(o.id)} ${statusBadge(o.status)}</h2>
    <p><strong>Customer:</strong> ${esc(o.customer.name)} · ${esc(o.customer.email)} · ${esc(o.customer.phone)}</p>
    <p><strong>Address:</strong> ${esc(o.address.house)}, ${esc(o.address.street)}, ${esc(o.address.barangay)}, ${esc(o.address.city)}, ${esc(o.address.province)} ${esc(o.address.postal)}</p>
    <p><strong>Payment:</strong> ${esc(o.payment)} · <strong>Date:</strong> ${new Date(o.date).toLocaleString('en-PH')}</p>
    <ul class="order-items">${o.items.map((i) => `<li><span>${esc(i.name)} × ${i.qty}</span><span>${peso(i.unit * i.qty)}</span></li>`).join('')}</ul>
    <p>Subtotal ${peso(o.subtotal)} · Discount -${peso(o.discount)} · Shipping ${peso(o.shipping)}</p>
    <h3>Total: ${peso(o.total)}</h3>
    <div class="modal-actions"><button class="btn" onclick="closeModal()">Close</button></div>`);
}

// ---------- Customers ----------
function renderCustomers() {
  const orders = getOrders();
  document.getElementById('custBody').innerHTML = getUsers().map((u) => {
    const active = u.active !== false;
    return `<tr><td><strong>${esc(u.username)}</strong></td><td>${esc(u.name || '-')}</td><td>${new Date(u.createdAt).toLocaleDateString('en-PH')}</td>
      <td>${orders.filter((o) => o.username === u.username).length}</td>
      <td>${statusBadge(active ? 'Active' : 'Deactivated')}</td>
      <td class="actions"><button class="btn btn-sm" onclick="toggleCustomer('${u.username}')">${active ? 'Deactivate' : 'Activate'}</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCustomer('${u.username}')">Delete</button></td></tr>`;
  }).join('') || '<tr><td colspan="6">No customers registered yet.</td></tr>';
}
function toggleCustomer(username) {
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  user.active = user.active === false;
  saveUsers(users);
  renderCustomers();
}
function deleteCustomer(username) {
  if (!confirm('Delete this customer account?')) return;
  saveUsers(getUsers().filter((u) => u.username !== username));
  renderCustomers();
}

// ---------- Inventory ----------
function renderInventory() {
  document.getElementById('invBody').innerHTML = getProducts().map((p) => `
    <tr><td>${esc(p.brand)} ${esc(p.name)}</td><td>${peso(salePrice(p))}</td><td>${p.stock}</td>
      <td><span class="stock ${stockClass(p)}">${getStockStatus(p)}</span></td>
      <td class="actions"><input class="stock-input" id="stock-${p.id}" type="number" min="0" value="${p.stock}">
        <button class="btn btn-sm" onclick="updateStock(${p.id})">Update</button></td></tr>`).join('');
}
function updateStock(id) {
  const value = Number(document.getElementById('stock-' + id).value);
  if (!Number.isInteger(value) || value < 0) { toast('Enter a valid stock number', 'error'); return; }
  const products = getProducts();
  products.find((p) => p.id === id).stock = value;
  saveProducts(products);
  renderInventory();
  toast('Stock updated');
}

// ---------- Sales report ----------
function renderSales() {
  const orders = getOrders();
  const valid = orders.filter((o) => o.status !== 'Cancelled');
  const totalSales = valid.reduce((sum, o) => sum + o.total, 0);

  // Count units sold per product and revenue per brand
  const unitsSold = {}, revenueByBrand = {};
  valid.forEach((o) => o.items.forEach((i) => {
    unitsSold[i.name] = (unitsSold[i.name] || 0) + i.qty;
    revenueByBrand[i.brand] = (revenueByBrand[i.brand] || 0) + i.unit * i.qty;
  }));
  const best = Object.entries(unitsSold).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('salesCards').innerHTML = statCards([
    ['💰', 'Total Sales', peso(totalSales)],
    ['🧾', 'Total Orders', orders.length],
    ['✅', 'Completed Orders', orders.filter((o) => o.status === 'Delivered').length],
    ['❌', 'Cancelled Orders', orders.filter((o) => o.status === 'Cancelled').length],
    ['🏆', 'Best-Selling Product', best ? `${esc(best[0])} (${best[1]} sold)` : 'No sales yet']
  ]);

  // Simple bar chart made with HTML and CSS only
  const rows = Object.entries(revenueByBrand).sort((a, b) => b[1] - a[1]);
  const max = rows.length ? rows[0][1] : 1;
  document.getElementById('salesChart').innerHTML = rows.map(([brand, amount]) => `
    <div class="bar-row"><span class="bar-label">${esc(brand)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round((amount / max) * 100)}%"></div></div>
      <span class="bar-value">${peso(amount)}</span></div>`).join('') || '<p class="muted">No sales yet. Place an order to see the chart.</p>';
}
