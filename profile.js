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
    const detailLinks = document.querySelectorAll('.order-details-link');
    detailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const orderCard = this.closest('.order-card');
            const orderNumber = orderCard.querySelector('.order-number')?.textContent || 'Заказ';
            showNotification(`Открываю детали заказа ${orderNumber}`, 'success');
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