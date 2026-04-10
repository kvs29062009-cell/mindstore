document.addEventListener("DOMContentLoaded", () => {

  const sizeButtons = document.querySelectorAll(".size");
  const controls = document.getElementById("cart-controls");
  const sizesCountEl = document.getElementById("sizesCount");

  let selectedSize = null;
  let quantity = 0;
  let maxAvailable = 0;

  const productBase = {
    id: "club-box",
    name: document.querySelector("h1").textContent,
    price: Number(document.querySelector(".new-price").textContent.replace(/\D/g, "")),
    image: document.querySelector(".thumbnail")?.src || document.querySelector(".main-image")?.src
  };

  // ===== ИНИЦИАЛИЗАЦИЯ НАЛИЧИЯ РАЗМЕРОВ =====
  if (typeof window.productSizes !== 'undefined') {
    window.productSizes.updateSizesAvailability();
    
    const availableSizes = Array.from(sizeButtons).filter(btn => 
      !btn.classList.contains('out-of-stock')
    ).length;
    
    if (sizesCountEl) {
      sizesCountEl.textContent = `В наличии: ${availableSizes} размеров`;
    }
  }

  // ===== ВЫБОР РАЗМЕРА =====
  sizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains('out-of-stock')) {
        window.productSizes?.showSizeUnavailableMessage(btn.textContent);
        return;
      }
      
      sizeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSize = btn.textContent;
      
      // Получаем максимальное количество для этого размера (скрыто)
      maxAvailable = window.productSizes?.getMaxQuantity(selectedSize) || 1;
      
      checkExisting();
    });
  });

  // ===== ПРОВЕРКА: ЕСТЬ ЛИ ТОВАР В КОРЗИНЕ =====
  function checkExisting() {
    if (!selectedSize) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const found = cart.find(
      item => item.id === productBase.id && item.size === selectedSize
    );

    if (found) {
      quantity = found.quantity;
      // Если количество в корзине превышает доступное, корректируем
      if (quantity > maxAvailable) {
        quantity = maxAvailable;
        save();
      }
      renderQty();
    } else {
      quantity = 0;
      renderAdd();
    }
  }

  // ===== КНОПКА "ДОБАВИТЬ В КОРЗИНУ" =====
  function renderAdd() {
    controls.innerHTML = `
      <button id="add-to-cart" class="buy">Добавить в корзину</button>
    `;

    document.getElementById("add-to-cart").onclick = () => {
      if (!selectedSize) {
        alert("Выберите размер");
        return;
      }
      
      const selectedBtn = Array.from(sizeButtons).find(btn => 
        btn.textContent === selectedSize
      );
      
      if (selectedBtn?.classList.contains('out-of-stock')) {
        window.productSizes?.showSizeUnavailableMessage(selectedSize);
        return;
      }
      
      quantity = 1;
      
      // Проверяем лимит
      if (!window.productSizes?.canAddQuantity(selectedSize, quantity)) {
        window.productSizes?.showLimitMessage();
        return;
      }
      
      save();
      renderQty();
    };
  }

  // ===== КНОПКИ - 1 + и "В КОРЗИНУ" =====
  function renderQty() {
    controls.innerHTML = `
      <div class="qty-wrapper">
        <button class="qty-btn" id="minus" ${quantity <= 1 ? 'disabled' : ''}>−</button>
        <span class="qty-value">${quantity}</span>
        <button class="qty-btn" id="plus" ${quantity >= maxAvailable ? 'disabled' : ''}>+</button>
      </div>
      <button class="to-cart">В корзину</button>
    `;

    document.getElementById("plus").onclick = () => {
      const newQuantity = quantity + 1;
      
      // Проверяем лимит
      if (!window.productSizes?.canAddQuantity(selectedSize, newQuantity)) {
        window.productSizes?.showLimitMessage();
        return;
      }
      
      quantity = newQuantity;
      save();
      renderQty();
    };

    document.getElementById("minus").onclick = () => {
      quantity--;
      if (quantity <= 0) {
        remove();
        renderAdd();
      } else {
        save();
        renderQty();
      }
    };

    document.querySelector(".to-cart").onclick = () => {
      window.location.href = "cart.html";
    };
  }

  // ===== СОХРАНЕНИЕ =====
  function save() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const index = cart.findIndex(
      item => item.id === productBase.id && item.size === selectedSize
    );

    const unwanted = document.getElementById("unwanted-clubs")?.value || "";

    if (index >= 0) {
      cart[index].quantity = quantity;
      cart[index].unwanted = unwanted;
    } else {
      cart.push({
        ...productBase,
        size: selectedSize,
        quantity,
        unwanted
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Показываем уведомление о добавлении
    showAddToCartNotification();
  }

  // ===== УВЕДОМЛЕНИЕ О ДОБАВЛЕНИИ =====
  function showAddToCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'limit-message';
    notification.style.background = '#4caf50';
    notification.style.borderLeftColor = '#2e7d32';
    notification.textContent = '✅ Товар добавлен в корзину';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // ===== УДАЛЕНИЕ =====
  function remove() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(
      item => !(item.id === productBase.id && item.size === selectedSize)
    );
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Показываем уведомление об удалении
    const notification = document.createElement('div');
    notification.className = 'limit-message';
    notification.style.background = '#f44336';
    notification.style.borderLeftColor = '#d32f2f';
    notification.textContent = '🗑️ Товар удален из корзины';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // стартовое состояние
  renderAdd();

});




