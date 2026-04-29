document.addEventListener("DOMContentLoaded", () => {

  const cartItemsContainer = document.getElementById("cart-items");
  const productsPriceEl = document.getElementById("products-price");
  const deliveryPriceEl = document.getElementById("delivery-price");
  const totalPriceEl = document.getElementById("total-price");

  const DELIVERY_PRICE = 550;
  const PROMO_CODE = "KN30FBW2";
  const PROMO_DISCOUNT = 0.30;

  // 👉 читаем промокод при загрузке
  let promoApplied = localStorage.getItem("promo") === PROMO_CODE;

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

      // 🔒 защита от старых товаров
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

    let discount = promoApplied ? productsTotal * PROMO_DISCOUNT : 0;

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
      if (promoInput.value.trim().toUpperCase() === PROMO_CODE) {
        promoApplied = true;
        localStorage.setItem("promo", PROMO_CODE);
        promoMessage.textContent = "Промокод применён 🎉 Скидка 30%";
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











