/* ============================================================
   checkout.js - checkout form, validation and order creation
   ============================================================ */

const checkoutForm = document.getElementById('checkoutForm');

if (checkoutForm) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
  } else if (getCart().length === 0) {
    document.getElementById('checkoutWrap').innerHTML =
      '<div class="empty"><h2>Your cart is empty</h2><p>Add a smartphone before checking out.</p><a class="btn" href="products.html">Shop Now</a></div>';
  } else {
    // Pre-fill what we already know about the customer
    document.getElementById('fullName').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('orderSummary').innerHTML = buildSummary();
    document.querySelectorAll('input[name="payment"]').forEach((r) => r.addEventListener('change', showPaymentNote));
    showPaymentNote();
    checkoutForm.addEventListener('submit', placeOrder);
  }
}

function buildSummary() {
  const t = calculateTotals(getCart());
  return `<h3>Order Summary</h3>
    ${t.lines.map((l) => `<div class="sum-item"><span>${esc(l.product.name)} × ${l.qty}</span><span>${peso(l.lineTotal)}</span></div>`).join('')}
    <hr>${totalsHtml(t)}`;
}

function showPaymentNote() {
  const method = document.querySelector('input[name="payment"]:checked').value;
  const notes = {
    'Cash on Delivery': 'Pay in cash when your order arrives.',
    'GCash': 'Send your payment to GCash number 0912 345 6789 (JUDy Mobile Store) and keep the reference number.',
    'Bank Transfer': 'Transfer to BDO account 0000-1234-5678 (JUDy Mobile Store) and keep the receipt.'
  };
  document.getElementById('paymentNote').textContent = notes[method];
}

// Order number format: JDY-YYYYMMDD-001
function generateOrderNumber() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const prefix = 'JDY-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
  const countToday = getOrders().filter((o) => o.id.startsWith(prefix)).length;
  return prefix + '-' + String(countToday + 1).padStart(3, '0');
}

function validateCheckout(cart) {
  const errors = [];
  const value = (id) => document.getElementById(id).value.trim();
  if (cart.length === 0) errors.push('Your cart is empty.');

  const required = [['fullName', 'Full Name'], ['email', 'Email'], ['phone', 'Contact Number'], ['house', 'House/Building'],
    ['street', 'Street'], ['barangay', 'Barangay'], ['city', 'City/Municipality'], ['province', 'Province'], ['postal', 'Postal Code']];
  required.forEach(([id, label]) => { if (!value(id)) errors.push(label + ' is required.'); });

  if (value('email') && !isValidEmail(value('email'))) errors.push('Email is not valid.');
  if (value('phone') && !/^(09|\+639)\d{9}$/.test(value('phone'))) errors.push('Contact number must look like 09123456789.');
  if (value('postal') && !/^\d{4}$/.test(value('postal'))) errors.push('Postal code must be 4 digits.');

  // Stock check
  cart.forEach((item) => {
    const product = getProduct(item.id);
    if (!product) errors.push('A product in your cart no longer exists.');
    else if (product.stock <= 0) errors.push(product.name + ' is out of stock.');
    else if (item.qty > product.stock) errors.push(product.name + ': only ' + product.stock + ' in stock (you ordered ' + item.qty + ').');
  });
  return errors;
}

function placeOrder(event) {
  event.preventDefault();
  const cart = getCart();
  const errors = validateCheckout(cart);
  const errorBox = document.getElementById('checkoutErrors');

  if (errors.length > 0) {
    errorBox.innerHTML = '<strong>Please fix the following:</strong><ul>' + errors.map((e) => `<li>${esc(e)}</li>`).join('') + '</ul>';
    errorBox.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const value = (id) => document.getElementById(id).value.trim();
  const totals = calculateTotals(cart);
  const order = {
    id: generateOrderNumber(),
    username: getCurrentUser().username,
    customer: { name: value('fullName'), email: value('email'), phone: value('phone') },
    address: { house: value('house'), street: value('street'), barangay: value('barangay'), city: value('city'), province: value('province'), postal: value('postal') },
    payment: document.querySelector('input[name="payment"]:checked').value,
    items: totals.lines.map((l) => ({ id: l.product.id, name: l.product.name, brand: l.product.brand, qty: l.qty, unit: l.unit })),
    subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, total: totals.total,
    status: 'Pending',
    date: new Date().toISOString()
  };

  // 1. Save order  2. Reduce stock  3. Clear cart
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  const products = getProducts();
  order.items.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    product.stock -= item.qty;
    product.popularity += item.qty;
  });
  saveProducts(products);

  // Remember contact details in the profile
  const users = getUsers();
  const me = users.find((u) => u.username === order.username);
  if (me) {
    if (!me.name) me.name = order.customer.name;
    if (!me.email) me.email = order.customer.email;
    if (!me.phone) me.phone = order.customer.phone;
    if (!me.address) me.address = [order.address.house, order.address.street, order.address.barangay, order.address.city, order.address.province, order.address.postal].join(', ');
    saveUsers(users);
  }

  saveCart([]);
  window.location.href = 'orders.html?new=' + encodeURIComponent(order.id);
}
