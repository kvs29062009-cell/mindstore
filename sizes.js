// База данных наличия размеров с количеством (скрытое)
const productSizesAvailability = {
  // Для черных кроссовок
  'black': {
    '38': { available: false, maxQuantity: 0 },   // максимум 5 шт
    '39': { available: false, maxQuantity: 0 },   // максимум 3 шт
    '40': { available: false, maxQuantity: 0 },  // нет в наличии
    '41': { available: true, maxQuantity: 1 },   // максимум 7 шт
    '42': { available: true, maxQuantity: 1 },  // нет в наличии
    '43': { available: true, maxQuantity: 1 },   // максимум 2 шт
    '44': { available: false, maxQuantity: 0 }   // нет в наличии
  },
  // Для красных кроссовок
  'red': {
    '38': { available: false, maxQuantity: 0 },
    '39': { available: false, maxQuantity: 0 },
    '40': { available: false, maxQuantity: 0 },
    '41': { available: false, maxQuantity: 0 },
    '42': { available: true, maxQuantity: 1 },
    '43': { available: true, maxQuantity: 1 },
    '44': { available: false, maxQuantity: 0 }
  },
  // Для серых кроссовок
  'gray': {
    '38': { available: false, maxQuantity: 0 },
    '39': { available: false, maxQuantity: 0 },
    '40': { available: true, maxQuantity: 1 },
    '41': { available: true, maxQuantity: 1 },
    '42': { available: true, maxQuantity: 1 },
    '43': { available: false, maxQuantity: 0 },
    '44': { available: false, maxQuantity: 0 }
  },
  // Для случайного цвета
  'random': {
    '38': { available: false, maxQuantity: 0 },
    '39': { available: false, maxQuantity: 0 },
    '40': { available: true, maxQuantity: 1 },
    '41': { available: true, maxQuantity: 2 },
    '42': { available: true, maxQuantity: 3 },
    '43': { available: true, maxQuantity: 2 },
    '44': { available: false, maxQuantity: 0 }
  }
};

// Функция для определения цвета товара по URL или контенту
function getProductColor() {
  const url = window.location.href;
  const title = document.querySelector('h1')?.textContent || '';
  
  if (url.includes('black') || title.includes('Чёрные')) {
    return 'black';
  } else if (url.includes('red') || title.includes('Красные')) {
    return 'red';
  } else if (url.includes('gray') || title.includes('Серые') || url.includes('grey')) {
    return 'gray';
  } else if (url.includes('random') || title.includes('Случайный') || title.includes('Секретный')) {
    return 'random';
  }
  
  return 'black';
}

// Функция для проверки наличия размера
function isSizeAvailable(size) {
  const productColor = getProductColor();
  const sizeData = productSizesAvailability[productColor]?.[size];
  
  if (sizeData) {
    return sizeData.available && sizeData.maxQuantity > 0;
  }
  
  return true;
}

// Функция для получения максимального количества
function getMaxQuantity(size) {
  const productColor = getProductColor();
  const sizeData = productSizesAvailability[productColor]?.[size];
  
  if (sizeData && sizeData.available) {
    return sizeData.maxQuantity;
  }
  
  return 0;
}

// Функция для проверки, можно ли добавить указанное количество
function canAddQuantity(size, requestedQuantity) {
  const maxQuantity = getMaxQuantity(size);
  return requestedQuantity <= maxQuantity;
}

// Функция для обновления отображения размеров (только доступность)
function updateSizesAvailability() {
  const sizeButtons = document.querySelectorAll('.size');
  const productColor = getProductColor();
  
  sizeButtons.forEach(button => {
    const size = button.textContent;
    const sizeData = productSizesAvailability[productColor]?.[size];
    const isAvailable = sizeData?.available && sizeData?.maxQuantity > 0;
    
    if (!isAvailable) {
      button.classList.add('out-of-stock');
      button.disabled = true;
      button.setAttribute('aria-label', `Размер ${size} нет в наличии`);
    } else {
      button.classList.remove('out-of-stock');
      button.disabled = false;
      button.setAttribute('aria-label', `Размер ${size} в наличии`);
    }
  });
  
  // Добавляем простую легенду
  addSimpleLegend();
}

// Простая легенда (без информации о количестве)
function addSimpleLegend() {
  if (document.querySelector('.size-legend')) {
    return;
  }
  
  const sizesContainer = document.querySelector('.sizes');
  if (!sizesContainer) return;
  
  const legend = document.createElement('div');
  legend.className = 'size-legend';
  legend.innerHTML = `
    <div class="legend-item">
      <span class="legend-dot available"></span> В наличии
    </div>
    <div class="legend-item">
      <span class="legend-dot unavailable"></span> Нет в наличии
    </div>
  `;
  
  sizesContainer.appendChild(legend);
}

// Функция для показа уведомления о лимите
function showLimitMessage() {
  const oldMessage = document.querySelector('.limit-message');
  if (oldMessage) {
    oldMessage.remove();
  }
  
  const message = document.createElement('div');
  message.className = 'limit-message';
  message.textContent = 'Доступное количество ограничено';
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.classList.add('fade-out');
    setTimeout(() => message.remove(), 300);
  }, 2000);
}

// Экспортируем функции
window.productSizes = {
  isSizeAvailable,
  getMaxQuantity,
  canAddQuantity,
  updateSizesAvailability,
  showLimitMessage,
  showSizeUnavailableMessage: (size) => {
    const message = document.createElement('div');
    message.className = 'limit-message';
    message.style.background = '#d32f2f';
    message.textContent = `Размер ${size} временно отсутствует`;
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.classList.add('fade-out');
      setTimeout(() => message.remove(), 300);
    }, 2000);
  }
};