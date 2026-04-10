// Глобальные переменные для галереи
let currentImageIndex = 0;
let productImages = [];

document.addEventListener("DOMContentLoaded", () => {
  // Собираем все изображения товара
  const thumbnails = document.querySelectorAll('.thumbnail');
  productImages = Array.from(thumbnails).map(thumb => thumb.src);
  
  // Добавляем обработчики для клавиш клавиатуры
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      changeImage(-1);
    } else if (e.key === 'ArrowRight') {
      changeImage(1);
    }
  });

  // Добавляем поддержку свайпа для мобильных
  const mainImage = document.getElementById('mainImage');
  let touchStartX = 0;
  let touchEndX = 0;

  mainImage.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  mainImage.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Свайп влево - следующее фото
      changeImage(1);
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Свайп вправо - предыдущее фото
      changeImage(-1);
    }
  }
});

// Функция для смены изображения
function changeImage(direction) {
  const thumbnails = document.querySelectorAll('.thumbnail');
  const newIndex = currentImageIndex + direction;
  
  if (newIndex >= 0 && newIndex < thumbnails.length) {
    setImage(newIndex);
  }
}

// Функция для установки конкретного изображения
function setImage(index) {
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  // Обновляем основное изображение
  mainImage.src = thumbnails[index].src;
  mainImage.alt = thumbnails[index].alt;
  
  // Обновляем активный класс у миниатюр
  thumbnails.forEach(thumb => thumb.classList.remove('active'));
  thumbnails[index].classList.add('active');
  
  // Обновляем текущий индекс
  currentImageIndex = index;
  
  // Добавляем эффект появления
  mainImage.style.animation = 'fadeIn 0.3s ease';
  setTimeout(() => {
    mainImage.style.animation = '';
  }, 300);
}

// Опционально: функция для предзагрузки изображений
function preloadImages() {
  productImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}