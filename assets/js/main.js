(function () {
  "use strict";

  var WHATSAPP_NUMBER = "256767343558";
  var LANG_KEY = "oroosh_lang";
  var I18N = window.OROOSH_I18N || { ar: {}, en: {} };

  /* ---------- Language engine ---------- */
  function getSavedLang() {
    try {
      return localStorage.getItem(LANG_KEY);
    } catch (e) {
      return null;
    }
  }
  function saveLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }

  function applyLanguage(lang) {
    var dict = I18N[lang] || I18N.ar;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict["meta.desc"]) metaDesc.setAttribute("content", dict["meta.desc"]);
    if (dict["meta.title"]) document.title = dict["meta.title"];

    document.querySelectorAll(".filter-tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.dataset.filter === (window.__oroosh_filter || "all"));
    });

    renderCart();
    currentLang = lang;
  }

  var currentLang = "ar";
  var langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", function () {
      var next = currentLang === "ar" ? "en" : "ar";
      saveLang(next);
      applyLanguage(next);
    });
  }

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

  /* ---------- Category filter ---------- */
  window.__oroosh_filter = "all";
  document.querySelectorAll(".filter-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var filter = tab.dataset.filter;
      window.__oroosh_filter = filter;
      document.querySelectorAll(".filter-tab").forEach(function (t) {
        t.classList.toggle("active", t === tab);
      });
      document.querySelectorAll(".product-card").forEach(function (card) {
        var show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });

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

  var cartToggle = document.getElementById("cartToggle");
  var cartClose = document.getElementById("cartClose");
  var cartDrawer = document.getElementById("cartDrawer");
  var cartOverlay = document.getElementById("cartOverlay");
  var cartItemsEl = document.getElementById("cartItems");
  var cartCountEl = document.getElementById("cartCount");
  var cartTotalEl = document.getElementById("cartTotal");
  var confirmOrderBtn = document.getElementById("confirmOrder");

  function t(key) {
    var dict = I18N[currentLang] || I18N.ar;
    return dict[key] !== undefined ? dict[key] : key;
  }

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

  function bumpCartBadge() {
    cartCountEl.classList.remove("bump");
    void cartCountEl.offsetWidth;
    cartCountEl.classList.add("bump");
  }

  function renderCart() {
    var ids = Object.keys(cart);
    var totalQty = 0;
    var totalPrice = 0;

    if (ids.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">' + t("cart.empty") + "</p>";
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
          '">' +
          t("cart.remove") +
          "</button>";
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
      var name = card.querySelector(".product-name-en").textContent.trim();
      var price = parseInt(btn.dataset.price, 10);
      var stepper = card.querySelector(".qty-stepper");
      var qty = stepper ? parseInt(stepper.dataset.qty, 10) : 1;

      if (cart[id]) {
        cart[id].qty += qty;
      } else {
        cart[id] = { name: name, price: price, qty: qty };
      }

      renderCart();
      bumpCartBadge();

      var addLabel = btn.querySelector("[data-i18n]");
      var originalKey = addLabel ? addLabel.getAttribute("data-i18n") : null;
      if (addLabel) addLabel.textContent = t("product.added");
      setTimeout(function () {
        if (addLabel && originalKey) addLabel.textContent = t(originalKey);
      }, 1200);
    });
  });

  confirmOrderBtn.addEventListener("click", function () {
    var ids = Object.keys(cart);
    if (ids.length === 0) {
      alert(t("cart.alertEmpty"));
      return;
    }

    var payMethodInput = document.querySelector('input[name="payMethod"]:checked');
    var payMethodLabel = payMethodInput && payMethodInput.value === "cod" ? t("cod.label") : t("momo.label");

    var lines = [t("wa.greeting"), t("wa.intro"), ""];
    var total = 0;
    ids.forEach(function (id) {
      var item = cart[id];
      var subtotal = item.qty * item.price;
      total += subtotal;
      lines.push("- " + item.name + " × " + item.qty + " = " + formatUGX(subtotal));
    });
    lines.push("");
    lines.push(t("wa.total") + ": " + formatUGX(total));
    lines.push(t("wa.payment") + ": " + payMethodLabel);
    lines.push("");
    lines.push(t("wa.name") + ": ");
    lines.push(t("wa.address") + ": ");
    lines.push("");
    lines.push(t("wa.closing"));

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
        copyBtn.textContent = t("momo.copied");
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

  /* ---------- Init ---------- */
  var initialLang = getSavedLang() || "ar";
  applyLanguage(initialLang);
})();
