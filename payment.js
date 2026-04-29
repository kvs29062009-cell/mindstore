document.addEventListener("DOMContentLoaded", () => {
  // ---------- КОНСТАНТЫ ----------
  const DELIVERY_PRICE = 550;
  const PROMO_CODE = "KN30FBW2";
  const PROMO_DISCOUNT = 0.30;

  // ---------- НАСТРОЙКИ EMAILJS (ЗАМЕНИТЕ НА СВОИ) ----------
  const EMAILJS_SERVICE_ID = "service_g05zmnl";   // Ваш Service ID
  const EMAILJS_TEMPLATE_ID = "template_sp3cq9d";  // Ваш Template ID
  // ----------------------------------------------------------

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const customer = JSON.parse(localStorage.getItem("customer")) || {};

  const totalEl = document.getElementById("payment-total");
  const timerEl = document.getElementById("payment-timer");
  const paidBtn = document.getElementById("paid-btn");
  const successBanner = document.getElementById("success-banner");
  const successScreen = document.getElementById("payment-success");

  // ----- РАСЧЁТ СУММЫ -----
  let productsTotal = 0;
  cart.forEach(item => {
    productsTotal += (item.price || 0) * (item.quantity || 1);
  });
  const promo = localStorage.getItem("promo");
  let discount = (promo === PROMO_CODE) ? productsTotal * PROMO_DISCOUNT : 0;
  const total = productsTotal - discount + DELIVERY_PRICE;

  if (totalEl) totalEl.textContent = total.toLocaleString() + " ₽";

  if (cart.length === 0) {
    if (paidBtn) {
      paidBtn.disabled = true;
      paidBtn.textContent = "Корзина пуста";
    }
    if (timerEl) timerEl.textContent = "0:00";
    return;
  }

  // ----- ТАЙМЕР 15 МИНУТ -----
  let timeLeft = 15 * 60;
  const timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (paidBtn) {
        paidBtn.disabled = true;
        paidBtn.textContent = "Время истекло";
      }
      if (timerEl) timerEl.textContent = "0:00";
    } else {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      if (timerEl) timerEl.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
  }, 1000);

  // ----- ФОРМИРОВАНИЕ ТЕКСТА ЗАКАЗА ДЛЯ ПИСЬМА -----
  function buildOrderHTML() {
    let itemsHtml = "";
    cart.forEach((item, idx) => {
      const qty = item.quantity || 1;
      itemsHtml += `
        <tr>
          <td>${idx+1}</td>
          <td>${escapeHtml(item.name || "Товар")}</td>
          <td>${item.size || "—"}</td>
          <td>${qty}</td>
          <td>${((item.price || 0) * qty).toLocaleString()} ₽</td>
        </tr>
      `;
      if (item.unwanted) {
        itemsHtml += `<tr><td colspan="5"><small>⚠️ Нежелательные клубы: ${escapeHtml(item.unwanted)}</small></td></tr>`;
      }
    });

    return `
      <h2>Новый заказ</h2>
      <p><strong>Клиент:</strong> ${escapeHtml(customer.name || "—")}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(customer.phone || "—")}</p>
      <p><strong>ПВЗ СДЭК:</strong> ${escapeHtml(customer.address || "—")}</p>
      <hr/>
      <h3>Товары:</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr><th>#</th><th>Название</th><th>Размер</th><th>Кол-во</th><th>Сумма</th></tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <hr/>
      <p><strong>Сумма товаров:</strong> ${productsTotal.toLocaleString()} ₽</p>
      ${discount > 0 ? `<p><strong>Скидка:</strong> ${discount.toLocaleString()} ₽</p>` : ""}
      <p><strong>Доставка:</strong> ${DELIVERY_PRICE} ₽</p>
      <p><strong>ИТОГО К ОПЛАТЕ:</strong> ${total.toLocaleString()} ₽</p>
      <p><em>Статус: ожидает проверки оплаты</em></p>
    `;
  }

  // Простая защита от XSS
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    });
  }

  // ----- ОТПРАВКА ЧЕРЕЗ EMAILJS -----
  async function sendOrderViaEmail() {
    const templateParams = {
      to_email: "vs29062009@gmail.com",   // ← СЮДА ВАШ EMAIL (можно также оставить пустым, если заполните в шаблоне)
      customer_name: customer.name || "—",
      customer_phone: customer.phone || "—",
      customer_address: customer.address || "—",
      order_html: buildOrderHTML(),
      order_total: total.toLocaleString() + " ₽"
    };

    try {
      const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      console.log("Письмо отправлено!", response);
      return true;
    } catch (error) {
  console.error("Ошибка EmailJS:", error);
  let errorMsg = error.text || error.message || "Неизвестная ошибка";
  alert("Не удалось отправить заказ.\n\n" + errorMsg);
  return false;
}
  }

  // ----- ОБРАБОТЧИК КНОПКИ "Я ОПЛАТИЛ" -----
  if (paidBtn) {
    paidBtn.addEventListener("click", async () => {
      paidBtn.disabled = true;
      const originalText = paidBtn.textContent;
      paidBtn.textContent = "Отправка...";

      const success = await sendOrderViaEmail();

      if (success) {
        if (successBanner) successBanner.classList.add("show");
        localStorage.removeItem("cart");
        localStorage.removeItem("customer");
        localStorage.removeItem("promo");
        if (successScreen) successScreen.classList.remove("hidden");
        if (paidBtn) paidBtn.style.display = "none";
      } else {
        paidBtn.disabled = false;
        paidBtn.textContent = originalText;
      }
    });
  }
});
