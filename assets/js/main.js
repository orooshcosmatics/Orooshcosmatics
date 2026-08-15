(function () {
  "use strict";

  var WHATSAPP_NUMBER = "256767343558";

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
      });
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 12) {
      header.style.boxShadow = "0 8px 24px -16px rgba(184,31,94,.4)";
    } else {
      header.style.boxShadow = "none";
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  /* ---------- Quantity steppers ---------- */
  document.querySelectorAll(".qty-stepper").forEach(function (stepper) {
    var valEl = stepper.querySelector(".qty-val");
    var minus = stepper.querySelector(".minus");
    var plus = stepper.querySelector(".plus");

    minus.addEventListener("click", function () {
      var qty = parseInt(stepper.dataset.qty, 10);
      qty = Math.max(1, qty - 1);
      stepper.dataset.qty = qty;
      valEl.textContent = qty;
    });
    plus.addEventListener("click", function () {
      var qty = parseInt(stepper.dataset.qty, 10);
      qty = Math.min(20, qty + 1);
      stepper.dataset.qty = qty;
      valEl.textContent = qty;
    });
  });

  /* ---------- Cart ---------- */
  var cart = {}; // id -> { name, price, qty }

  var cartFab = document.getElementById("cartFab");
  var cartToggle = document.getElementById("cartToggle");
  var cartClose = document.getElementById("cartClose");
  var cartDrawer = document.getElementById("cartDrawer");
  var cartOverlay = document.getElementById("cartOverlay");
  var cartItemsEl = document.getElementById("cartItems");
  var cartCountEl = document.getElementById("cartCount");
  var cartTotalEl = document.getElementById("cartTotal");
  var confirmOrderBtn = document.getElementById("confirmOrder");

  function formatUGX(n) {
    return n.toLocaleString("en-US") + " UGX";
  }

  function openCart() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  }
  function closeCart() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  }
  cartToggle.addEventListener("click", openCart);
  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  function renderCart() {
    var ids = Object.keys(cart);
    var totalQty = 0;
    var totalPrice = 0;

    if (ids.length === 0) {
      cartItemsEl.innerHTML =
        '<p class="cart-empty">لسه ماضفتيش أي منتج، اختاري منتجاتك من المتجر 🛍️</p>';
    } else {
      cartItemsEl.innerHTML = "";
      ids.forEach(function (id) {
        var item = cart[id];
        totalQty += item.qty;
        totalPrice += item.qty * item.price;

        var row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML =
          '<div><p class="cart-item-name">' +
          item.name +
          '</p><p class="cart-item-sub">' +
          item.qty +
          " × " +
          formatUGX(item.price) +
          "</p></div>" +
          '<button class="cart-item-remove" data-id="' +
          id +
          '">إزالة</button>';
        cartItemsEl.appendChild(row);
      });

      cartItemsEl.querySelectorAll(".cart-item-remove").forEach(function (btn) {
        btn.addEventListener("click", function () {
          delete cart[btn.dataset.id];
          renderCart();
        });
      });
    }

    cartCountEl.textContent = totalQty;
    cartTotalEl.textContent = formatUGX(totalPrice);
  }

  document.querySelectorAll(".btn-add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".product-card");
      var id = card.dataset.id;
      var name = btn.dataset.name;
      var price = parseInt(btn.dataset.price, 10);
      var stepper = card.querySelector(".qty-stepper");
      var qty = stepper ? parseInt(stepper.dataset.qty, 10) : 1;

      if (cart[id]) {
        cart[id].qty += qty;
      } else {
        cart[id] = { name: name, price: price, qty: qty };
      }

      renderCart();
      openCart();

      btn.textContent = "✓ تمت الإضافة";
      setTimeout(function () {
        btn.textContent = "🛒 أضف للطلب";
      }, 1200);
    });
  });

  confirmOrderBtn.addEventListener("click", function () {
    var ids = Object.keys(cart);
    if (ids.length === 0) {
      alert("اختاري منتج واحد على الأقل قبل تأكيد الطلب 🌸");
      return;
    }

    var lines = ["مرحبًا OROOSH COSMETICS 🌸", "حابة أأكد طلب:", ""];
    var total = 0;
    ids.forEach(function (id) {
      var item = cart[id];
      var subtotal = item.qty * item.price;
      total += subtotal;
      lines.push("- " + item.name + " × " + item.qty + " = " + formatUGX(subtotal));
    });
    lines.push("");
    lines.push("الإجمالي: " + formatUGX(total));
    lines.push("");
    lines.push("الاسم: ");
    lines.push("المنطقة/العنوان: ");
    lines.push("");
    lines.push("منتظرة تأكيدكم قبل الدفع 🙏");

    var message = encodeURIComponent(lines.join("\n"));
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + message, "_blank");
  });

  /* ---------- Copy Mobile Money number ---------- */
  var copyBtn = document.getElementById("copyMomo");
  var momoNumber = document.getElementById("momoNumber");
  if (copyBtn && momoNumber) {
    copyBtn.addEventListener("click", function () {
      var text = momoNumber.textContent.trim();
      var done = function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = "✓ تم النسخ";
        setTimeout(function () {
          copyBtn.textContent = original;
        }, 1500);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        done();
      }
    });
  }

  renderCart();
})();
