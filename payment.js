document.addEventListener("DOMContentLoaded", () => {

  const DELIVERY_PRICE = 550;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const customer = JSON.parse(localStorage.getItem("customer")) || {};

  const paidBtn = document.getElementById("paid-btn");
  const totalEl = document.getElementById("payment-total");
  const timerEl = document.getElementById("payment-timer");
  const successBanner = document.getElementById("success-banner");
  const successScreen = document.getElementById("payment-success");

  // ===== СЧЁТ СУММЫ =====
  let productsTotal = 0;
  cart.forEach(item => {
    productsTotal += (item.price || 0) * (item.quantity || 1);
  });

  const promo = localStorage.getItem("promo");
let discount = 0;

if (promo === "UHGYYUD") {
  discount = productsTotal * 0.10;
}

const total = productsTotal - discount + DELIVERY_PRICE;

  // ===== ВЫВОД СУММЫ =====
  if (totalEl) {
    totalEl.textContent = total + " ₽";
  }

  // ===== ТАЙМЕР (15 МИНУТ) =====
  let timeLeft = 15 * 60;

  if (timerEl) {
    const timerInterval = setInterval(() => {

      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;

      timerEl.textContent =
        `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        paidBtn.disabled = true;
        paidBtn.textContent = "Время оплаты истекло";
      }

      timeLeft--;

    }, 1000);
  }

  // ===== КНОПКА "Я ОПЛАТИЛ" =====
  if (paidBtn) {
    paidBtn.addEventListener("click", () => {

      paidBtn.disabled = true;
      paidBtn.textContent = "Отправка...";

      if (successBanner) {
        successBanner.classList.add("show");
      }

      const TELEGRAM_TOKEN = "8530716292:AAGnUVtvVO0Bz6_H6pgjRhouKUkEfRdlqno";
      const CHAT_ID = "8166008737";

      let text = "🛒 *Новый заказ*\n\n";

      cart.forEach((item, i) => {
        text += `${i + 1}. ${item.name}\n`;
        text += `Размер: ${item.size}\n`;
        text += `Количество: ${item.quantity}\n`;
        text += `Цена: ${item.price} ₽\n\n`;
        text += `Нежелательные клубы: ${item.unwanted}\n`;
      });

      text += `👤 ФИО: ${customer.name || "-"}\n`;
      text += `📞 Телефон: ${customer.phone || "-"}\n`;
      text += `📍 ПВЗ СДЭК: ${customer.address || "-"}\n`;
      text += `💰 Итого: ${total} ₽\n`;
      text += `⏳ Статус: ОЖИДАЕТ ПРОВЕРКИ`;

      fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown"
        })
      })
      .then(() => {

        localStorage.removeItem("cart");
        localStorage.removeItem("customer");
        localStorage.removeItem("promo");

       document.querySelectorAll(".payment-content").forEach(el => {
         el.style.display = "none";
       });

       document.getElementById("payment-success").classList.remove("hidden");


        if (successScreen) {
          successScreen.classList.remove("hidden");
        }

      })
      .catch(() => {
        alert("Ошибка отправки заказа");
        paidBtn.disabled = false;
        paidBtn.textContent = "Я оплатил";
      });

    });
  }

});









