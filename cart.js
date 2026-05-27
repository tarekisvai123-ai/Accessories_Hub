// cart.js - LuxAccessories Shopping Cart
(function () {
  const STORAGE_KEY = 'lux_cart';
  const ORDERS_KEY = 'lux_orders';

  function getCart() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  }
  function formatCurrency(n) {
    return 'USD ' + Number(n).toFixed(2);
  }

  function addToCart(item) {
    var cart = getCart();
    var index = -1;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].title === item.title) { index = i; break; }
    }
    if (index > -1) {
      cart[index].qty = (cart[index].qty || 1) + (item.qty || 1);
    } else {
      cart.push({ title: item.title, price: Number(item.price || 0), img: item.img || '', qty: item.qty || 1 });
    }
    saveCart(cart);
    showToast(item.title + ' added to cart');
  }

  function removeFromCart(index) {
    var cart = getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      saveCart(cart);
    }
  }

  function updateQuantity(index, qty) {
    var cart = getCart();
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
    var cart = getCart();
    var count = 0;
    for (var i = 0; i < cart.length; i++) {
      count += Number(cart[i].qty) || 0;
    }
    return count;
  }

  function updateCartBadge() {
    var badge = document.getElementById('cart-count');
    if (badge) badge.textContent = getCartCount();
  }

  var toastTimer;
  function showToast(text) {
    var el = document.getElementById('lux-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lux-toast';
      el.style.cssText = 'position:fixed;right:18px;bottom:18px;background:linear-gradient(135deg,#1a2a4a,#2a3a5a);color:#fff;padding:14px 20px;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,0.5);z-index:9999;font-size:14px;border:1px solid rgba(74,111,165,0.4);transition:opacity 0.3s;';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.style.opacity = '0'; }, 2400);
  }

  function renderCartPage() {
    var root = document.getElementById('cart-root');
    if (!root) return;
    var cart = getCart();
    root.innerHTML = '';

    if (!cart.length) {
      root.innerHTML = '<div style="text-align:center;padding:40px 0;"><p style="color:#aaa;font-size:16px;margin-bottom:16px;">Your cart is empty.</p><a href="accessories.html" class="btn">Continue Shopping</a></div>';
      updateCartBadge();
      return;
    }

    var total = 0;
    var html = '<div class="cart-items">';
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var linePrice = Number(item.price || 0) * Number(item.qty || 1);
      total += linePrice;
      html += '<div class="cart-item" style="display:flex;align-items:center;gap:16px;padding:16px;background:#1a1a2e;border-radius:12px;margin-bottom:12px;border:1px solid rgba(74,111,165,0.15);">';
      html += '<img src="' + (item.img || '') + '" alt="' + item.title + '" style="width:70px;height:70px;object-fit:cover;border-radius:8px;background:#2a2a3e;" onerror="this.style.display=\'none\'">';
      html += '<div style="flex:1;"><h3 style="font-size:15px;color:#fff;margin-bottom:4px;">' + item.title + '</h3><p style="font-size:13px;color:#7ca4e0;">' + formatCurrency(item.price) + ' each</p></div>';
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      html += '<button class="qty-btn" data-action="minus" data-index="' + i + '" style="width:30px;height:30px;border-radius:50%;border:1px solid #4a6fa5;background:transparent;color:#fff;cursor:pointer;font-size:16px;">-</button>';
      html += '<span style="color:#fff;min-width:24px;text-align:center;">' + item.qty + '</span>';
      html += '<button class="qty-btn" data-action="plus" data-index="' + i + '" style="width:30px;height:30px;border-radius:50%;border:1px solid #4a6fa5;background:transparent;color:#fff;cursor:pointer;font-size:16px;">+</button>';
      html += '</div>';
      html += '<div style="min-width:80px;text-align:right;color:#fff;font-weight:600;">' + formatCurrency(linePrice) + '</div>';
      html += '<button class="remove-btn" data-index="' + i + '" style="background:none;border:none;color:#e55;cursor:pointer;font-size:18px;padding:4px 8px;" title="Remove">&times;</button>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div style="margin-top:20px;padding:20px;background:#1a1a2e;border-radius:12px;border:1px solid rgba(74,111,165,0.15);">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
    html += '<span style="color:#aaa;font-size:16px;">Total (' + getCartCount() + ' items)</span>';
    html += '<span style="color:#fff;font-size:22px;font-weight:700;">' + formatCurrency(total) + '</span>';
    html += '</div>';
    html += '<div style="display:flex;gap:12px;margin-top:16px;justify-content:flex-end;">';
    html += '<button id="clearCartBtn" class="btn" style="background:#333;color:#ccc;">Clear Cart</button>';
    html += '<a href="checkout.html" class="btn">Checkout</a>';
    html += '</div></div>';

    root.innerHTML = html;

    // Attach event listeners
    root.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(this.dataset.index);
        var action = this.dataset.action;
        var cart = getCart();
        if (action === 'plus') {
          updateQuantity(idx, cart[idx].qty + 1);
        } else {
          if (cart[idx].qty <= 1) { removeFromCart(idx); }
          else { updateQuantity(idx, cart[idx].qty - 1); }
        }
        renderCartPage();
      });
    });

    root.querySelectorAll('.remove-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFromCart(Number(this.dataset.index));
        renderCartPage();
      });
    });

    var clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('Clear entire cart?')) { clearCart(); renderCartPage(); }
      });
    }

    updateCartBadge();
  }

  function renderCheckoutPage() {
    var root = document.getElementById('checkout-root');
    if (!root) return;
    var cart = getCart();
    if (!cart.length) {
      root.innerHTML = '<p style="color:#aaa;">Your cart is empty. <a href="accessories.html" style="color:#7ca4e0;">Shop now</a></p>';
      return;
    }
    var total = 0;
    var html = '<h3 style="margin-bottom:12px;">Order Summary</h3><div style="margin-bottom:20px;">';
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var line = item.price * item.qty;
      total += line;
      html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(74,111,165,0.15);color:#ccc;">';
      html += '<span>' + item.title + ' x' + item.qty + '</span><span>' + formatCurrency(line) + '</span></div>';
    }
    html += '<div style="display:flex;justify-content:space-between;padding:12px 0;color:#fff;font-weight:700;font-size:16px;"><span>Total</span><span>' + formatCurrency(total) + '</span></div>';
    html += '</div>';
    root.innerHTML = html;

    var form = document.getElementById('checkoutForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = new FormData(form);
      var order = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        customer: { name: formData.get('name'), email: formData.get('email'), phone: formData.get('phone'), address: formData.get('address') },
        items: cart,
        total: total
      };
      var orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      clearCart();
      document.querySelector('.main-content').innerHTML = '<div style="text-align:center;padding:40px;"><h2 style="color:#4caf50;">Order Placed!</h2><p style="color:#aaa;margin:12px 0;">Thank you, ' + order.customer.name + '.</p><p style="color:#fff;">Order ID: <strong>' + order.id + '</strong></p><p style="color:#7ca4e0;font-size:20px;margin:12px 0;">' + formatCurrency(order.total) + '</p><a href="index.html" class="btn" style="margin-top:16px;">Return to Shop</a></div>';
    });
  }

  function attachButtons() {
    // Add cart link to header
    var authAreas = document.querySelectorAll('.auth-links');
    authAreas.forEach(function (area) {
      if (area.querySelector('#cart-link')) return;
      var a = document.createElement('a');
      a.href = 'cart.html';
      a.id = 'cart-link';
      a.style.cssText = 'color:#7ca4e0;margin-left:8px;text-decoration:none;padding:8px 14px;border-radius:16px;border:1px solid #4a6fa5;';
      a.innerHTML = 'Cart (<span id="cart-count">0</span>)';
      area.appendChild(a);
    });
    updateCartBadge();

    // Add buttons to product cards (but NOT on cart page)
    if (document.getElementById('cart-root')) return;

    document.querySelectorAll('.product-card').forEach(function (card) {
      if (card.querySelector('.add-to-cart')) return;
      var spans = card.querySelectorAll('span');
      var title = spans.length ? spans[0].textContent.trim() : 'Product';
      var priceEl = card.querySelector('.price');
      var priceText = priceEl ? priceEl.textContent : '';
      var price = parseFloat(priceText.replace(/[^0-9.-]+/g, '')) || 0;
      var imgEl = card.querySelector('img');
      var img = imgEl ? imgEl.src : '';

      var btn = document.createElement('button');
      btn.className = 'btn add-to-cart';
      btn.style.cssText = 'margin-top:8px;padding:8px 16px;font-size:12px;';
      btn.textContent = 'Add to Cart';
      btn.addEventListener('click', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        addToCart({ title: title, price: price, img: img, qty: 1 });
      });
      card.appendChild(btn);
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    attachButtons();
    updateCartBadge();
    renderCartPage();
    renderCheckoutPage();
  });

  // Expose globally
  window.luxAddToCart = addToCart;
})();
