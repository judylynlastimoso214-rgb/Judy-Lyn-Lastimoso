/* ============================================================
   orders.js - order confirmation and order history (customer)
   ============================================================ */

function orderCardHtml(order) {
  return `
  <article class="order-card">
    <div class="order-head">
      <div><h3>Order #${esc(order.id)}</h3><small>${new Date(order.date).toLocaleString('en-PH')}</small></div>
      ${statusBadge(order.status)}
    </div>
    <ul class="order-items">${order.items.map((i) => `<li><span>${esc(i.name)} × ${i.qty}</span><span>${peso(i.unit * i.qty)}</span></li>`).join('')}</ul>
    <div class="order-foot">
      <span>Payment: <strong>${esc(order.payment)}</strong></span>
      <span>Total: <strong class="blue">${peso(order.total)}</strong></span>
    </div>
    <details><summary>View order details</summary>
      <p><strong>Deliver to:</strong> ${esc(order.customer.name)}, ${esc(order.customer.phone)}<br>
      ${esc(order.address.house)}, ${esc(order.address.street)}, ${esc(order.address.barangay)}, ${esc(order.address.city)}, ${esc(order.address.province)} ${esc(order.address.postal)}</p>
      <p>Subtotal ${peso(order.subtotal)} · Discount -${peso(order.discount)} · Shipping ${order.shipping === 0 ? 'FREE' : peso(order.shipping)}</p>
    </details>
  </article>`;
}

function renderOrdersPage() {
  const list = document.getElementById('ordersList');
  if (!list) return;
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html?redirect=orders.html'; return; }

  // Confirmation message after placing an order
  const newId = getParam('new');
  if (newId) {
    document.getElementById('confirmBox').innerHTML = `
      <div class="confirm"><div class="check">✓</div><h2>Thank you for your order!</h2>
      <p class="order-no">Order #${esc(newId)}</p><p>Order status: ${statusBadge('Pending')}</p>
      <p class="muted">We will notify you when your order is confirmed.</p></div>`;
  }

  // Newest orders first; always read fresh data so admin status updates show here
  const mine = getOrders().filter((o) => o.username === user.username).reverse();
  list.innerHTML = mine.map(orderCardHtml).join('') ||
    '<div class="empty"><h2>No orders yet</h2><a class="btn" href="products.html">Start Shopping</a></div>';
}

document.addEventListener('DOMContentLoaded', renderOrdersPage);
