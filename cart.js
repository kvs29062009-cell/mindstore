document.addEventListener("DOMContentLoaded", () => {

  const cartItemsContainer = document.getElementById("cart-items");
  const productsPriceEl = document.getElementById("products-price");
  const deliveryPriceEl = document.getElementById("delivery-price");
  const totalPriceEl = document.getElementById("total-price");

  const DELIVERY_PRICE = 600;

  // ----- СПИСОК ПРОМОКОДОВ -----
  const PROMO_CODES = [
    { code: "K19G40WH", discount: 0.30 },
    { code: "S93HL24",  discount: 0.20 }
  ];

  // ----- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ПОИСКА СКИДКИ -----
  function getDiscountByCode(code) {
    if (!code) return 0;
    const found = PROMO_CODES.find(p => p.code === code.toUpperCase());
    return found ? found.discount : 0;
  }

  // 👉 читаем применённый промокод из localStorage
  let appliedPromoCode = localStorage.getItem("promo") || null;

  // ===== РЕНДЕР КОРЗИНЫ =====
  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartItemsContainer.innerHTML = "";

    let productsTotal = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Корзина пуста</p>";
      productsPriceEl.textContent = "0";
      deliveryPriceEl.textContent = DELIVERY_PRICE;
      totalPriceEl.textContent = DELIVERY_PRICE;
      return;
    }

    cart.forEach((item, index) => {
      const qty = item.quantity ? item.quantity : 1;
      productsTotal += item.price * qty;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-info">
          <h3>${item.name}</h3>
          <p>Размер: ${item.size}</p>
          <p>Количество: ${qty}</p>
          <p>Цена: ${item.price} ₽</p>
          ${item.unwanted ? `<p class="unwanted">Нежелательные клубы: ${item.unwanted}</p>` : ""}
          <button class="remove-btn" data-index="${index}">Удалить</button>
        </div>
      `;

      cartItemsContainer.appendChild(div);
    });

    // ---- Расчёт скидки ----
    const discountPercent = getDiscountByCode(appliedPromoCode);
    const discount = productsTotal * discountPercent;

    productsPriceEl.textContent = productsTotal;
    deliveryPriceEl.textContent = DELIVERY_PRICE;
    totalPriceEl.textContent = productsTotal - discount + DELIVERY_PRICE;

    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        removeItem(btn.dataset.index);
      });
    });
  }

  // ===== УДАЛЕНИЕ =====
  function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }

  // ===== ПРОМОКОД =====
  const promoInput = document.getElementById("promo");
  const promoBtn = document.getElementById("apply-promo");
  const promoMessage = document.getElementById("promo-message");

  if (promoBtn) {
    promoBtn.addEventListener("click", () => {
      const entered = promoInput.value.trim().toUpperCase();
      const found = PROMO_CODES.find(p => p.code === entered);

      if (found) {
        appliedPromoCode = entered;
        localStorage.setItem("promo", entered);
        promoMessage.textContent = `Промокод применён 🎉 Скидка ${Math.round(found.discount * 100)}%`;
        promoMessage.style.color = "green";
        renderCart();
      } else {
        promoMessage.textContent = "Неверный промокод";
        promoMessage.style.color = "red";
      }
    });
  }

  renderCart();

  // ===== ПЕРЕХОД К ОПЛАТЕ =====
  const goPaymentBtn = document.getElementById("go-payment");

  if (goPaymentBtn) {
    goPaymentBtn.addEventListener("click", () => {

      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const address = document.getElementById("address").value.trim();

      if (!name || !phone || !address) {
        alert("Заполните все данные доставки");
        return;
      }

      localStorage.setItem("customer", JSON.stringify({
        name,
        phone,
        address
      }));

      window.location.href = "payment.html";
    });
  }

});










