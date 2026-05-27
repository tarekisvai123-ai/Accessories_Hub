// Cart functionality for LuxAccessories
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price, image) {
  var cart = getCart();
  // Check if item already in cart
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].name === name) {
      cart[i].qty += 1;
      found = true;
      break;
    }
  }
  if (!found) {
    cart.push({ name: name, price: price, qty: 1, image: image });
  }
  saveCart(cart);
  alert(name + " added to cart!");
}

// Auto-attach to any button with class "add-to-cart-btn"
document.addEventListener("DOMContentLoaded", function() {
  var buttons = document.querySelectorAll(".add-to-cart-btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var name = this.getAttribute("data-name");
      var price = parseFloat(this.getAttribute("data-price"));
      var image = this.getAttribute("data-image") || "";
      addToCart(name, price, image);
    });
  }
});
