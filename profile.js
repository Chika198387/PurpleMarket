// profile.js

// ===== УПРАВЛЕНИЕ ФОРМОЙ =====
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.querySelector('.profile-form');
    const saveBtn = profileForm.querySelector('.save-btn');
    const formInputs = profileForm.querySelectorAll('.form-input');

    // Функция для показа кнопки
    function showSaveButton() {
        // Убираем все стили скрытия
        saveBtn.style.display = '';
        saveBtn.style.opacity = '1';
        saveBtn.style.transform = 'translateY(0)';
        saveBtn.style.height = '';
        saveBtn.style.padding = '';
        saveBtn.style.margin = '';
        saveBtn.style.overflow = '';
        saveBtn.style.border = '';
        saveBtn.style.pointerEvents = '';
        saveBtn.style.background = '';
        saveBtn.textContent = 'Сохранить изменения';
        saveBtn.disabled = false;
    }

    // Следим за изменениями в полях формы
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Если кнопка скрыта, показываем её
            if (saveBtn.style.display === 'none') {
                showSaveButton();
                showNotification('✏️ Данные изменены, сохраните изменения', 'info');
            }
        });

        input.addEventListener('change', function() {
            // Дополнительная проверка для select, checkbox и т.д.
            if (saveBtn.style.display === 'none') {
                showSaveButton();
                showNotification('✏️ Данные изменены, сохраните изменения', 'info');
            }
        });
    });

    // Обработка отправки формы
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Собираем данные формы
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim()
        };

        // Простая валидация
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            showNotification('Пожалуйста, заполните все поля!', 'warning');
            return;
        }

        if (!formData.email.includes('@') || !formData.email.includes('.')) {
            showNotification('Введите корректный email!', 'warning');
            return;
        }

        // Имитация сохранения
        saveBtn.textContent = 'Сохранение...';
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.7';

        setTimeout(function() {
            saveBtn.textContent = '✅ Сохранено!';
            saveBtn.style.background = 'linear-gradient(135deg, #00D4AA, #00B894)';
            saveBtn.style.opacity = '1';

            showNotification('Данные успешно обновлены!', 'success');

            // Через 4 секунды кнопка полностью исчезает
            setTimeout(function() {
                saveBtn.style.transition = 'all 0.8s ease';
                saveBtn.style.opacity = '0';
                saveBtn.style.transform = 'translateY(-20px)';
                saveBtn.style.height = '0';
                saveBtn.style.padding = '0';
                saveBtn.style.margin = '0';
                saveBtn.style.overflow = 'hidden';
                saveBtn.style.border = 'none';
                saveBtn.style.pointerEvents = 'none';
                
                // Полное скрытие через 0.8с (после завершения анимации)
                setTimeout(function() {
                    saveBtn.style.display = 'none';
                }, 800);
            }, 4000);
        }, 800);
    });

    // ===== УВЕДОМЛЕНИЯ (TOAST) =====
    function showNotification(message, type = 'success') {
        // Удаляем старое уведомление, если есть
        const oldToast = document.querySelector('.toast-notification');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;

        // Иконка в зависимости от типа
        let icon = '✅';
        if (type === 'warning') icon = '⚠️';
        if (type === 'error') icon = '❌';
        if (type === 'info') icon = 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        // Стили уведомления (встроенные, чтобы не зависеть от основного CSS)
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 16px 24px;
            border-radius: 16px;
            color: #fff;
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 9999;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
            max-width: 420px;
            animation: slideIn 0.4s ease-out;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(16, 0, 43, 0.95);
        `;

        // Стили для разных типов
        const typeStyles = {
            success: { borderLeft: '4px solid #00D4AA' },
            warning: { borderLeft: '4px solid #FFB347' },
            error: { borderLeft: '4px solid #FF3B5C' },
            info: { borderLeft: '4px solid #7B2CBF' }
        };

        if (typeStyles[type]) {
            toast.style.borderLeft = typeStyles[type].borderLeft;
        }

        // Кнопка закрытия
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #9D4EDD;
            font-size: 24px;
            cursor: pointer;
            padding: 0 4px;
            line-height: 1;
            transition: color 0.3s;
        `;

        closeBtn.addEventListener('mouseenter', function() {
            this.style.color = '#fff';
        });

        closeBtn.addEventListener('mouseleave', function() {
            this.style.color = '#9D4EDD';
        });

        closeBtn.addEventListener('click', function() {
            toast.remove();
        });

        // Добавляем анимацию появления (через keyframes)
        const styleSheet = document.querySelector('#toast-styles');
        if (!styleSheet) {
            const newStyle = document.createElement('style');
            newStyle.id = 'toast-styles';
            newStyle.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(newStyle);
        }

        document.body.appendChild(toast);

        // Автоудаление через 5 секунд
        setTimeout(function() {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }
        }, 5000);

        // Клик по уведомлению — закрыть
        toast.addEventListener('click', function(e) {
            if (e.target !== closeBtn) {
                toast.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(function() {
                    toast.remove();
                }, 300);
            }
        });
    }

    // ===== ВЫХОД ИЗ ПРОФИЛЯ =====
    const logoutLink = document.querySelector('.profile-nav-link.logout');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                showNotification('Выход выполнен успешно!', 'success');
                // Здесь можно добавить редирект на страницу входа
                // window.location.href = 'login.html';

                // Имитация выхода — меняем текст ссылки
                this.textContent = '🚪 Выход выполнен';
                this.style.color = '#00D4AA';
                setTimeout(() => {
                    this.textContent = 'Выйти';
                    this.style.color = '';
                }, 3000);
            }
        });
    }

    // ===== ПОДСВЕТКА АКТИВНОЙ ССЫЛКИ В НАВИГАЦИИ =====
    const navLinks = document.querySelectorAll('.profile-nav-link:not(.logout)');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) {
            link.classList.add('active');
        } else if (href === '#' && link.classList.contains('active')) {
            // Оставляем активной первую ссылку, если она не ведёт никуда
        }
    });

    // ===== АНИМАЦИЯ КАРТОЧЕК ЗАКАЗОВ ПРИ НАВЕДЕНИИ =====
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ===== КНОПКА "ПОДРОБНЕЕ" ДЛЯ ЗАКАЗОВ =====
// ===== МОДАЛЬНОЕ ОКНО С ДЕТАЛЯМИ ЗАКАЗА =====
function showOrderModal(orderCard) {
    const oldModal = document.querySelector('.order-modal-overlay');
    if (oldModal) oldModal.remove();

    const orderNumber = orderCard.querySelector('.order-number')?.textContent || 'Заказ';
    const orderDate = orderCard.querySelector('.order-date')?.textContent || '';
    const statusEl = orderCard.querySelector('.order-status');
    const statusText = statusEl?.textContent || '';
    const statusClass = statusEl?.className.replace('order-status', '').trim() || '';
    const orderTotal = orderCard.querySelector('.order-total')?.textContent || '';

    const items = Array.from(orderCard.querySelectorAll('.order-item')).map(el => el.textContent);

    const statusColors = {
        delivered: { bg: 'rgba(0, 212, 170, 0.15)', color: '#00D4AA' },
        processing: { bg: 'rgba(255, 179, 71, 0.15)', color: '#FFB347' },
        cancelled: { bg: 'rgba(255, 59, 92, 0.15)', color: '#FF3B5C' }
    };
    const statusStyle = statusColors[statusClass] || { bg: 'rgba(123, 44, 191, 0.15)', color: '#C77DFF' };

    const overlay = document.createElement('div');
    overlay.className = 'order-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    const modal = document.createElement('div');
    modal.className = 'order-modal';
    modal.style.cssText = `
        background: linear-gradient(145deg, #1A0533, #2D1040);
        border: 1px solid rgba(123, 44, 191, 0.3);
        border-radius: 24px;
        padding: 32px;
        max-width: 460px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
        animation: slideUp 0.4s ease;
        color: #E0D6F5;
    `;

    const itemsHTML = items.map(item => `
        <div style="
            background: rgba(123, 44, 191, 0.12);
            border: 1px solid rgba(123, 44, 191, 0.25);
            border-radius: 12px;
            padding: 10px 14px;
            font-size: 14px;
            color: #E0D6F5;
        ">${item}</div>
    `).join('');

    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div>
                <h2 style="font-size: 20px; color: #fff; margin: 0 0 6px;">${orderNumber}</h2>
                <span style="font-size: 13px; color: #9D4EDD;">${orderDate}</span>
            </div>
            <button class="order-modal-close" style="
                background: none;
                border: none;
                color: #9D4EDD;
                font-size: 32px;
                cursor: pointer;
                transition: color 0.3s;
                line-height: 1;
            ">&times;</button>
        </div>

        <div style="margin-bottom: 20px;">
            <span style="
                display: inline-block;
                padding: 5px 14px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                background: ${statusStyle.bg};
                color: ${statusStyle.color};
            ">${statusText}</span>
        </div>

        <div style="margin-bottom: 20px;">
            <p style="font-size: 13px; font-weight: 600; color: #C77DFF; margin-bottom: 10px;">Состав заказа</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${itemsHTML}
            </div>
        </div>

        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid rgba(123, 44, 191, 0.2);
            margin-bottom: 24px;
        ">
            <span style="font-size: 14px; color: #C9B8E8;">Итого</span>
            <span style="font-size: 22px; font-weight: 800; color: #FFD166;">${orderTotal}</span>
        </div>

        <button class="order-modal-close-btn" style="
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 2px solid #7B2CBF;
            background: transparent;
            color: #C77DFF;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
            transition: all 0.3s;
        ">Закрыть</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Анимации (создаются один раз)
    if (!document.querySelector('#order-modal-anim-styles')) {
        const style = document.createElement('style');
        style.id = 'order-modal-anim-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    function closeModal() {
        overlay.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => overlay.remove(), 300);
    }

    overlay.querySelector('.order-modal-close').addEventListener('click', closeModal);
    overlay.querySelector('.order-modal-close-btn').addEventListener('click', closeModal);

    overlay.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    const closeBtn = overlay.querySelector('.order-modal-close-btn');
    closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(123, 44, 191, 0.2)';
        this.style.color = '#fff';
    });
    closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'transparent';
        this.style.color = '#C77DFF';
    });
}

// ===== КНОПКА "ПОДРОБНЕЕ" ДЛЯ ЗАКАЗОВ =====
const detailLinks = document.querySelectorAll('.order-details-link');
detailLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const orderCard = this.closest('.order-card');
        showOrderModal(orderCard);
    });
});

    // ===== ПОИСК (ХЕДЕР) =====
    const searchInput = document.querySelector('.search');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    showNotification(`Поиск: "${query}"`, 'success');
                    // Здесь можно добавить редирект на страницу поиска
                    // window.location.href = `catalog.html?search=${encodeURIComponent(query)}`;
                } else {
                    showNotification('Введите запрос для поиска', 'warning');
                }
            }
        });

        // Делаем поиск более заметным при фокусе
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 30px rgba(123, 44, 191, 0.15)';
            this.parentElement.style.borderRadius = '12px';
        });

        searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = 'none';
        });
    }

    // ===== ДОБАВЛЯЕМ ПЛАВНЫЙ СКРОЛЛ ДЛЯ КРОШЕК =====
    const breadcrumbLinks = document.querySelectorAll('.breadcrumbs a');
    breadcrumbLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Если ссылка ведёт на ту же страницу, не даём перезагружать
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });
    });

    // ===== ПРИВЕТСТВИЕ ПРИ ЗАГРУЗКЕ =====
    console.log('🟣 Purple Market — Профиль загружен');
    console.log('👤 Пользователь: Майкл Афтон');

    // Можно показывать приветствие один раз за сессию
    if (!sessionStorage.getItem('profileGreetingShown')) {
        setTimeout(() => {
            showNotification('👋 Добро пожаловать в профиль, Майкл!', 'success');
            sessionStorage.setItem('profileGreetingShown', 'true');
        }, 600);
    }
});