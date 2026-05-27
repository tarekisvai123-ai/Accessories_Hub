// cart.js - add to site root and include <script src="cart.js"></script> before </body> on every page
(function () {
  const STORAGE_KEY = 'lux_cart';
  const ORDERS_KEY = 'lux_orders';

  // Helpers
  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  }
  function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  }

  // Adds item (object: {title, price, img, qty})
  function addToCart(item) {
    const cart = getCart();
    const index = cart.findIndex(i => i.title === item.title);
    if (index > -1) {
      cart[index].qty = (cart[index].qty || 1) + (item.qty || 1);
    } else {
      cart.push({ title: item.title, price: Number(item.price || 0), img: item.img || '', qty: item.qty || 1 });
    }
    saveCart(cart);
    showToast(`${item.title} added to cart`);
  }

  function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart(cart);
    }
  }

  function updateQuantity(index, qty) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
      cart[index].qty = Math.max(1, Number(qty) || 1);
      saveCart(cart);
    }
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    updateCartBadge();
  }

  function getCartCount() {
    return getCart().reduce((s, it) => s + (Number(it.qty) || 0), 0);
  }

  // Header cart badge
  function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = getCartCount();
  }

  // Toast
  let toastTimer;
  function showToast(text) {
    let el = document.getElementById('lux-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lux-toast';
      el.style.position = 'fixed';
      el.style.right = '18px';
      el.style.bottom = '18px';
      el.style.background = '#1a1a2e';
      el.style.color = '#fff';
      el.style.padding = '12px 16px';
      el.style.borderRadius = '10px';
      el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
      el.style.zIndex = 9999;
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2400);
  }

  // Render cart page (cart.html) - call renderCartPage() if present
  function renderCartPage() {
    if (!document.getElementById('cart-root')) return;
    const root = document.getElementById('cart-root');
    const cart = getCart();
    root.innerHTML = '';
    if (!cart.length) {
      root.innerHTML = '<p>Your cart is empty. <a href="index.html">Continue shopping</a>.</p>';
      updateCartBadge();
      return;
    }
    const table = document.createElement('table');
    table.style.width = '100%';
    table.className = 'cart-table';
    const tbody = document.createElement('tbody');

    let total = 0;
    cart.forEach((item, i) => {
      const tr = document.createElement('tr');
      tr.style.verticalAlign = 'middle';

      // image
      const tdImg = document.createElement('td');
      tdImg.style.width = '100px';
      const img = document.createElement('img');
      img.src = item.img || '';
      img.alt = item.title;
      img.style.width = '80px';
      img.style.height = '80px';
      img.style.objectFit = 'cover';
      img.onerror = function () { this.style.display = 'none'; };
      tdImg.appendChild(img);
      tr.appendChild(tdImg);

      // title
      const tdTitle = document.createElement('td');
      tdTitle.textContent = item.title;
      tr.appendChild(tdTitle);

      // qty
      const tdQty = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.min = 1;
      input.value = item.qty;
      input.style.width = '70px';
      input.addEventListener('change', function () {
        updateQuantity(i, this.value);
        renderCartPage();
      });
      tdQty.appendChild(input);
      tr.appendChild(tdQty);

      // price
      const tdPrice = document.createElement('td');
      const linePrice = (Number(item.price || 0) * Number(item.qty || 1));
      tdPrice.textContent = formatCurrency(linePrice);
      tr.appendChild(tdPrice);

      // remove
      const tdRemove = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Remove';
      btn.addEventListener('click', function () {
        removeFromCart(i);
        renderCartPage();
      });
      tdRemove.appendChild(btn);
      tr.appendChild(tdRemove);

      tbody.appendChild(tr);

      total += linePrice;
    });

    table.appendChild(tbody);
    root.appendChild(table);

    const totalDiv = document.createElement('div');
    totalDiv.style.marginTop = '18px';
    totalDiv.innerHTML = `<strong>Total: ${formatCurrency(total)}</strong>`;
    root.appendChild(totalDiv);

    const actions = document.createElement('div');
    actions.style.marginTop = '12px';
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-secondary';
    clearBtn.textContent = 'Clear Cart';
    clearBtn.addEventListener('click', function () {
      if (confirm('Clear cart?')) { clearCart(); renderCartPage(); }
    });
    actions.appendChild(clearBtn);

    const checkoutBtn = document.createElement('a');
    checkoutBtn.className = 'btn';
    checkoutBtn.href = 'checkout.html';
    checkoutBtn.style.marginLeft = '12px';
    checkoutBtn.textContent = 'Proceed to Checkout';
    actions.appendChild(checkoutBtn);

    root.appendChild(actions);

    updateCartBadge();
  }

  // Render order confirmation (checkout.html) if present
  function renderCheckoutPage() {
    const root = document.getElementById('checkout-root');
    if (!root) return;
    const cart = getCart();
    if (!cart.length) {
      root.innerHTML = '<p>Your cart is empty. Please add items before checking out.<br><a href="index.html">Shop now</a></p>';
      return;
    }
    // Show a summary inside the page and the checkout form remains below
    const summary = document.createElement('div');
    summary.innerHTML = '<h3>Order summary</h3>';
    const ul = document.createElement('ul');
    cart.forEach(it => {
      const li = document.createElement('li');
      li.textContent = `${it.title} — ${it.qty} × ${formatCurrency(it.price)} = ${formatCurrency(it.qty * it.price)}`;
      ul.appendChild(li);
    });
    summary.appendChild(ul);
    const total = cart.reduce((s, it) => s + (it.price * it.qty), 0);
    const t = document.createElement('p');
    t.innerHTML = `<strong>Total: ${formatCurrency(total)}</strong>`;
    summary.appendChild(t);
    root.appendChild(summary);

    // form handling
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const order = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        customer: {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
        },
        items: cart,
        total: total
      };
      // save order to localStorage (simulated)
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      // clear cart
      clearCart();
      // show confirmation
      root.innerHTML = `<h2>Order placed</h2><p>Thank you, ${order.customer.name}. Your order ID: <strong>${order.id}</strong></p><p>Total: ${formatCurrency(order.total)}</p><p>A confirmation has been recorded locally (simulated).</p><p><a href="index.html">Return to shop</a></p>`;
    });
  }

  // Auto-add UI: add Add-to-cart button to each product-card and add header cart link
  function attachButtons() {
    // add cart link to header auth area
    const authAreas = document.querySelectorAll('.auth-links');
    authAreas.forEach(area => {
      if (area.querySelector('#cart-link')) return;
      const a = document.createElement('a');
      a.href = 'cart.html';
      a.id = 'cart-link';
      a.style.color = '#7ca4e0';
      a.style.marginLeft = '8px';
      a.innerHTML = 'Cart (<span id="cart-count">0</span>)';
      area.appendChild(a);
    });

    updateCartBadge();

    // Add buttons to product cards
    document.querySelectorAll('.product-card').forEach(card => {
      if (card.querySelector('.add-to-cart')) return; // don't duplicate
      const titleEl = card.querySelector('span');
      const title = titleEl ? titleEl.textContent.trim() : (card.dataset.title || 'Product');
      // find last .price if present
      const priceEls = card.querySelectorAll('.price');
      let priceText = priceEls.length ? priceEls[priceEls.length - 1].textContent : '';
      if (!priceText) {
        const sp = card.querySelector('span.price');
        priceText = sp ? sp.textContent : '';
      }
      const price = parseFloat(priceText.replace(/[^0-9.-]+/g, '')) || 0;
      const img = card.querySelector('img') ? card.querySelector('img').src : '';

      const btn = document.createElement('button');
      btn.className = 'btn add-to-cart';
      btn.style.marginTop = '8px';
      btn.textContent = 'Add to Cart';
      btn.addEventListener('click', function (evt) {
        evt.preventDefault();
        addToCart({ title, price, img, qty: 1 });
      });
      card.appendChild(btn);
    });

    // Hook modal Add-to-Cart if modal exists
    const modalAddBtn = document.querySelector('#productModal .btn');
    if (modalAddBtn) {
      // remove existing onclick to avoid conflict
      modalAddBtn.onclick = null;
      modalAddBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const title = document.getElementById('modalTitle') ? document.getElementById('modalTitle').textContent.trim() : 'Product';
        const priceText = document.getElementById('modalPrice') ? document.getElementById('modalPrice').textContent.trim() : '';
        const price = parseFloat((priceText || '').replace(/[^0-9.-]+/g, '')) || 0;
        const img = document.getElementById('modalImg') ? document.getElementById('modalImg').src : '';
        addToCart({ title, price, img, qty: 1 });
        // close modal if there is a closeModal function
        if (typeof closeModal === 'function') closeModal();
      });
    }
  }

  // On DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    attachButtons();
    updateCartBadge();
    // render pages if present
    renderCartPage();
    renderCheckoutPage();
  });

  // Expose addToCart for other inline scripts
  window.luxAddToCart = addToCart;
})();