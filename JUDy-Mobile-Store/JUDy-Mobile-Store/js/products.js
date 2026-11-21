/* ============================================================
   products.js - product cards, home sections, catalog, details
   ============================================================ */

// Builds the HTML of one product card
function productCard(p) {
  const outOfStock = p.stock <= 0;
  return `
  <article class="card">
    ${p.discount > 0 ? `<span class="discount-badge">-${p.discount}%</span>` : ''}
    <a class="card-img" href="product-details.html?id=${p.id}"><img src="${getImages(p)[0]}" alt="${esc(p.name)}"></a>
    <div class="card-body">
      <p class="brand">${esc(p.brand)}</p>
      <h3>${esc(p.name)}</h3>
      <div class="prices"><span class="sale-price">${peso(salePrice(p))}</span>
        ${p.discount > 0 ? `<s class="old-price">${peso(p.price)}</s>` : ''}</div>
      <span class="stock ${stockClass(p)}">${getStockStatus(p)}</span>
      <div class="card-actions">
        <a class="btn btn-outline btn-sm" href="product-details.html?id=${p.id}">View Details</a>
        <button class="btn btn-sm" onclick="addToCart(${p.id})" ${outOfStock ? 'disabled' : ''}>Add to Cart</button>
      </div>
    </div>
  </article>`;
}

function fillGrid(elementId, list) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = list.map(productCard).join('') || '<p class="muted">No products yet.</p>';
}

// ---------- Home page sections ----------
function renderHome() {
  if (!document.getElementById('featuredGrid')) return;
  const all = getProducts();
  fillGrid('featuredGrid', [...all].sort((a, b) => b.price - a.price).slice(0, 4));
  fillGrid('bestGrid', [...all].sort((a, b) => b.popularity - a.popularity).slice(0, 4));
  fillGrid('newGrid', [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4));
  fillGrid('discountGrid', all.filter((p) => p.discount > 0).sort((a, b) => b.discount - a.discount).slice(0, 4));
}

// ---------- Catalog: search, filter, sort ----------
function setupCatalog() {
  if (!document.getElementById('productGrid')) return;
  const brands = [...new Set(getProducts().map((p) => p.brand))].sort();
  document.getElementById('brandFilter').innerHTML =
    '<option value="all">All Brands</option>' + brands.map((b) => `<option value="${esc(b)}">${esc(b)}</option>`).join('');
  document.getElementById('searchInput').value = getParam('search') || '';

  ['searchInput', 'brandFilter', 'priceFilter', 'sortSelect'].forEach((id) => {
    document.getElementById(id).addEventListener(id === 'searchInput' ? 'input' : 'change', updateCatalog);
  });
  updateCatalog();
}

function updateCatalog() {
  const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
  const brand = document.getElementById('brandFilter').value;
  const price = document.getElementById('priceFilter').value;
  const sort = document.getElementById('sortSelect').value;

  let list = getProducts().filter((p) => {
    const matchesSearch = (p.name + ' ' + p.brand).toLowerCase().includes(keyword);
    const matchesBrand = brand === 'all' || p.brand === brand;
    let matchesPrice = true;
    if (price !== 'all') {
      const [min, max] = price.split('-').map(Number);
      matchesPrice = salePrice(p) >= min && salePrice(p) < max;
    }
    return matchesSearch && matchesBrand && matchesPrice;
  });

  if (sort === 'low') list.sort((a, b) => salePrice(a) - salePrice(b));
  if (sort === 'high') list.sort((a, b) => salePrice(b) - salePrice(a));
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'popularity') list.sort((a, b) => b.popularity - a.popularity);

  document.getElementById('resultCount').textContent = list.length + ' product(s) found';
  document.getElementById('productGrid').innerHTML =
    list.map(productCard).join('') || '<div class="empty">No smartphones match your search.</div>';
}

// ---------- Product details page ----------
function renderDetails() {
  const box = document.getElementById('productDetails');
  if (!box) return;
  const p = getProduct(getParam('id'));
  if (!p) { box.innerHTML = '<div class="empty"><h2>Product not found</h2><a class="btn" href="products.html">Back to Products</a></div>'; return; }

  const images = getImages(p);
  const out = p.stock <= 0;
  const specs = [
    ['RAM', p.ram], ['Storage', p.storage], ['Processor', p.processor], ['Main Camera', p.mainCamera],
    ['Front Camera', p.frontCamera], ['Battery', p.battery], ['Display', p.display],
    ['Operating System', p.os], ['Available Colors', p.colors.map((c) => `<span class="color-chip">${esc(c)}</span>`).join(' ')],
    ['Stock Quantity', p.stock + ' units']
  ];
  document.title = p.name + ' | JUDy Mobile Store';
  box.innerHTML = `
  <div class="details">
    <div class="gallery">
      <div class="main-img"><img id="mainImg" src="${images[0]}" alt="${esc(p.name)}"></div>
      <div class="thumbs">${images.map((src) => `<img src="${src}" alt="thumbnail" onclick="document.getElementById('mainImg').src=this.src">`).join('')}</div>
    </div>
    <div class="info">
      <p class="brand">${esc(p.brand)}</p>
      <h1>${esc(p.name)}</h1>
      <div class="prices big"><span class="sale-price">${peso(salePrice(p))}</span>
        ${p.discount > 0 ? `<s class="old-price">${peso(p.price)}</s><span class="discount-pill">-${p.discount}% OFF</span>` : ''}</div>
      <p><span class="stock ${stockClass(p)}">${getStockStatus(p)}</span> <span class="muted">${p.stock} unit(s) available</span></p>
      <p class="desc">${esc(p.description)}</p>
      <div class="qty-row"><strong>Quantity</strong>
        <div class="qty-box"><button type="button" onclick="changeDetailQty(-1, ${p.stock})">−</button>
          <input id="detailQty" type="number" min="1" max="${p.stock}" value="1">
          <button type="button" onclick="changeDetailQty(1, ${p.stock})">+</button></div></div>
      <div class="detail-actions">
        <button class="btn" onclick="detailAdd(${p.id}, false)" ${out ? 'disabled' : ''}>Add to Cart</button>
        <button class="btn btn-dark" onclick="detailAdd(${p.id}, true)" ${out ? 'disabled' : ''}>Buy Now</button>
      </div>
    </div>
  </div>
  <h2 class="spec-title">Specifications</h2>
  <table class="spec-table">${specs.map((s) => `<tr><th>${s[0]}</th><td>${s[1]}</td></tr>`).join('')}</table>`;
}

function changeDetailQty(change, max) {
  const input = document.getElementById('detailQty');
  let value = (parseInt(input.value) || 1) + change;
  input.value = Math.max(1, Math.min(value, max));
}

function detailAdd(id, buyNow) {
  const qty = parseInt(document.getElementById('detailQty').value) || 1;
  if (addToCart(id, qty) && buyNow) window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => { renderHome(); setupCatalog(); renderDetails(); });
