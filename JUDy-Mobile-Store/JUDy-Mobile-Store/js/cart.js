/* ============================================================
   cart.js - shopping cart functions (saved in LocalStorage)
   ============================================================ */

function addToCart(id, qty) {
  qty = qty || 1;
  const product = getProduct(id);
  if (!product) return false;
  if (product.stock <= 0) { toast('Sorry, this product is out of stock.', 'error'); return false; }

  const cart = getCart();
  const item = cart.find((i) => i.id === product.id);
  const newQty = (item ? item.qty : 0) + qty;
  if (newQty > product.stock) { toast('Only ' + product.stock + ' unit(s) available.', 'error'); return false; }

  if (item) item.qty = newQty; else cart.push({ id: product.id, qty: qty });
  saveCart(cart);
  updateCartBadge();
  toast(product.name + ' added to cart');
  return true;
}

function removeFromCart(id) {
  saveCart(getCart().filter((i) => i.id !== id));
  updateCartBadge();
  renderCart();
}

function setQty(id, qty) {
  const product = getProduct(id);
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item || !product) return;
  qty = parseInt(qty) || 1;
  if (qty < 1) qty = 1;
  if (qty > product.stock) { qty = product.stock; toast('Only ' + product.stock + ' unit(s) available.', 'error'); }
  item.qty = qty;
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

function changeQty(id, change) {
  const item = getCart().find((i) => i.id === id);
  if (item) setQty(id, item.qty + change);
}

function clearCart() {
  if (!confirm('Remove all items from your cart?')) return;
  saveCart([]);
  updateCartBadge();
  renderCart();
}

// Calculates subtotal, discount, shipping and total
function calculateTotals(cart) {
  const lines = [];
  let subtotal = 0;
  let discount = 0;
  cart.forEach((item) => {
    const product = getProduct(item.id);
    if (!product) return;
    const unit = salePrice(product);
    lines.push({ product, qty: item.qty, unit, lineTotal: unit * item.qty });
    subtotal += product.price * item.qty;
    discount += (product.price - unit) * item.qty;
  });
  const settings = getSettings();
  const afterDiscount = subtotal - discount;
  const shipping = lines.length === 0 ? 0 : (afterDiscount >= settings.freeShippingOver ? 0 : settings.shippingFee);
  return { lines, subtotal, discount, shipping, total: afterDiscount + shipping };
}

// HTML for the totals (used by cart and checkout pages)
function totalsHtml(t) {
  return `
    <div class="sum-row"><span>Subtotal</span><span>${peso(t.subtotal)}</span></div>
    <div class="sum-row"><span>Discount</span><span class="green">- ${peso(t.discount)}</span></div>
    <div class="sum-row"><span>Shipping Fee</span><span>${t.shipping === 0 ? 'FREE' : peso(t.shipping)}</span></div>
    <div class="sum-row total"><span>Total</span><span>${peso(t.total)}</span></div>`;
}

// Draws the cart page
function renderCart() {
  const itemsBox = document.getElementById('cartItems');
  if (!itemsBox) return;
  const totals = calculateTotals(getCart());

  if (totals.lines.length === 0) {
    itemsBox.innerHTML = `<div class="empty"><h2>Your cart is empty</h2><p>Looks like you have not added any smartphone yet.</p>
      <a class="btn" href="products.html">Continue Shopping</a></div>`;
    document.getElementById('cartSummary').style.display = 'none';
    return;
  }
  document.getElementById('cartSummary').style.display = 'block';

  itemsBox.innerHTML = `
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead>
      <tbody>${totals.lines.map((l) => `
        <tr>
          <td><div class="cell-product"><img src="${getImages(l.product)[0]}" alt=""><div><strong>${esc(l.product.name)}</strong><br><small>${esc(l.product.brand)}</small></div></div></td>
          <td>${peso(l.unit)}</td>
          <td><div class="qty-box">
            <button onclick="changeQty(${l.product.id}, -1)">−</button>
            <input type="number" min="1" max="${l.product.stock}" value="${l.qty}" onchange="setQty(${l.product.id}, this.value)">
            <button onclick="changeQty(${l.product.id}, 1)">+</button></div></td>
          <td><strong>${peso(l.lineTotal)}</strong></td>
          <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${l.product.id})">Remove</button></td>
        </tr>`).join('')}
      </tbody></table></div>
    <div class="cart-buttons"><a class="btn btn-outline" href="products.html">← Continue Shopping</a>
      <button class="btn btn-danger" onclick="clearCart()">Clear Cart</button></div>`;

  document.getElementById('cartSummary').innerHTML = `
    <h3>Order Summary</h3>${totalsHtml(totals)}
    <a class="btn btn-block" href="checkout.html">Proceed to Checkout</a>
    <p class="muted small">Free shipping for orders ₱${getSettings().freeShippingOver.toLocaleString()} and above.</p>`;
}

document.addEventListener('DOMContentLoaded', renderCart);
