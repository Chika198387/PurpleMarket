// ===== cart.js =====
// Работа с корзиной БЕЗ искусственных id — только через классы,
// которые уже есть в cart.html: .cart-item, .item-name, .item-price,
// .qty-input, .qty-btn, .item-total, .remove-btn и т.д.

const CART_QTY_STORAGE_KEY = 'cartQuantities'; // { "Название товара": количество }

// Демо-промокод
const PROMO_CODES = {
    'SPRING10': 0.10 // 10% скидка
};

const state = {
    promo: null
};

// ===== DOM =====
const DOM = {
    cartLayout: document.querySelector('.cart-layout'),
    emptyCart: document.querySelector('.empty-cart'),
    itemCountText: document.querySelector('.item-count-text'),
    cartBadges: document.querySelectorAll('.cart-badge'),
    subtotalValue: document.querySelector('.summary-row:not(.total) span:last-child'),
    totalValue: document.querySelector('.summary-row.total .summary-value'),
    promoInput: document.querySelector('.promo-input'),
    promoBtn: document.querySelector('.promo-btn'),
    checkoutBtn: document.querySelector('.checkout-btn')
};

// ===== УТИЛИТЫ =====
function formatPrice(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
}

function parsePrice(text) {
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
}

function pluralizeItems(n) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'товар';
    if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'товара';
    return 'товаров';
}

// Получить название товара из карточки (используется как ключ вместо id)
function getItemName(itemEl) {
    return itemEl.querySelector('.item-name').textContent.trim();
}

function getItemPrice(itemEl) {
    return parsePrice(itemEl.querySelector('.item-price').textContent);
}

function getQtyInput(itemEl) {
    return itemEl.querySelector('.qty-input');
}

// Кнопки «−» и «+» отличаем по содержимому, а не по новому классу
function getQtyButtons(itemEl) {
    const buttons = itemEl.querySelectorAll('.qty-btn');
    let minusBtn = null;
    let plusBtn = null;
    buttons.forEach(btn => {
        if (btn.textContent.trim() === '−') minusBtn = btn;
        else plusBtn = btn;
    });
    return { minusBtn, plusBtn };
}

// ===== СОХРАНЕНИЕ / ЗАГРУЗКА КОЛИЧЕСТВ =====
function loadSavedQuantities() {
    try {
        const saved = localStorage.getItem(CART_QTY_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error('Ошибка загрузки корзины:', e);
        return {};
    }
}

function saveQuantities() {
    const data = {};
    document.querySelectorAll('.cart-item').forEach(itemEl => {
        const name = getItemName(itemEl);
        const qty = Number(getQtyInput(itemEl).value) || 1;
        data[name] = qty;
    });
    try {
        localStorage.setItem(CART_QTY_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка сохранения корзины:', e);
    }
}

// Применяем сохранённые количества к карточкам при загрузке страницы
function restoreQuantities() {
    const saved = loadSavedQuantities();
    document.querySelectorAll('.cart-item').forEach(itemEl => {
        const name = getItemName(itemEl);
        if (saved[name]) {
            getQtyInput(itemEl).value = saved[name];
        }
    });
}

// ===== ПЕРЕСЧЁТ СУММ =====
function updateItemTotal(itemEl) {
    const price = getItemPrice(itemEl);
    const qty = Number(getQtyInput(itemEl).value) || 1;
    const totalEl = itemEl.querySelector('.item-total');
    totalEl.textContent = formatPrice(price * qty);
    pulse(totalEl);
}

function getSubtotal() {
    let sum = 0;
    document.querySelectorAll('.cart-item').forEach(itemEl => {
        sum += getItemPrice(itemEl) * (Number(getQtyInput(itemEl).value) || 1);
    });
    return sum;
}

function getDiscount(subtotal) {
    if (state.promo && PROMO_CODES[state.promo]) {
        return Math.round(subtotal * PROMO_CODES[state.promo]);
    }
    return 0;
}

function updateSummary() {
    const subtotal = getSubtotal();
    const discount = getDiscount(subtotal);
    const total = subtotal - discount;

    if (DOM.subtotalValue) DOM.subtotalValue.textContent = formatPrice(subtotal);
    if (DOM.totalValue) {
        DOM.totalValue.textContent = formatPrice(total);
        pulse(DOM.totalValue);
    }
}

function updateItemCount() {
    const items = document.querySelectorAll('.cart-item');
    const totalQty = Array.from(items).reduce(
        (sum, el) => sum + (Number(getQtyInput(el).value) || 1), 0
    );

    if (DOM.itemCountText) {
        DOM.itemCountText.textContent = items.length
            ? `(${totalQty} ${pluralizeItems(totalQty)})`
            : '';
    }

    DOM.cartBadges.forEach(badge => {
        badge.textContent = totalQty;
        badge.classList.remove('bump');
        void badge.offsetWidth;
        badge.classList.add('bump');
    });
}

function checkEmptyCart() {
    const hasItems = document.querySelectorAll('.cart-item').length > 0;
    if (DOM.cartLayout) DOM.cartLayout.style.display = hasItems ? '' : 'none';
    if (DOM.emptyCart) DOM.emptyCart.style.display = hasItems ? 'none' : 'block';
}

function pulse(el) {
    if (!el) return;
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
}

// ===== ИЗМЕНЕНИЕ КОЛИЧЕСТВА =====
function changeQuantity(itemEl, newQty) {
    newQty = Math.max(1, Math.min(10, newQty));
    getQtyInput(itemEl).value = newQty;

    updateItemTotal(itemEl);
    updateSummary();
    updateItemCount();
    saveQuantities();
}

// ===== УДАЛЕНИЕ ТОВАРА =====
function removeItem(itemEl) {
    itemEl.classList.add('removing');

    const cleanup = () => {
        itemEl.remove();
        updateSummary();
        updateItemCount();
        checkEmptyCart();
        saveQuantities();
    };

    itemEl.addEventListener('transitionend', cleanup, { once: true });
    setTimeout(cleanup, 500); // подстраховка, если transitionend не сработал
}

// ===== ПРОМОКОД =====
function applyPromo() {
    const code = DOM.promoInput.value.trim().toUpperCase();

    if (!code) {
        shake(DOM.promoInput);
        return;
    }

    if (PROMO_CODES[code]) {
        state.promo = code;
        updateSummary();
        DOM.promoBtn.classList.add('success');
        DOM.promoBtn.textContent = 'Применено ✓';
        showToast(`Промокод активирован: скидка ${PROMO_CODES[code] * 100}%`, 'success');
    } else {
        shake(DOM.promoInput);
        showToast('Такой промокод не найден', 'error');
    }
}

function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
}

// ===== ОФОРМЛЕНИЕ ЗАКАЗА (демо) =====
function checkout() {
    if (document.querySelectorAll('.cart-item').length === 0) return;

    DOM.checkoutBtn.disabled = true;
    DOM.checkoutBtn.classList.add('success');
    const originalText = DOM.checkoutBtn.textContent;
    DOM.checkoutBtn.textContent = 'Заказ оформлен ✓';

    showToast('Спасибо! Ваш заказ принят в обработку', 'success');

    setTimeout(() => {
        DOM.checkoutBtn.disabled = false;
        DOM.checkoutBtn.classList.remove('success');
        DOM.checkoutBtn.textContent = originalText;
    }, 2500);
}

// ===== УВЕДОМЛЕНИЯ =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== СОБЫТИЯ (навешиваются на каждую .cart-item, найденную по классу) =====
function setupItemListeners(itemEl) {
    const { minusBtn, plusBtn } = getQtyButtons(itemEl);
    const qtyInput = getQtyInput(itemEl);
    const removeBtn = itemEl.querySelector('.remove-btn');

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            changeQuantity(itemEl, Number(qtyInput.value) - 1);
        });
    }
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            changeQuantity(itemEl, Number(qtyInput.value) + 1);
        });
    }
    if (qtyInput) {
        qtyInput.addEventListener('change', () => {
            changeQuantity(itemEl, Number(qtyInput.value) || 1);
        });
    }
    if (removeBtn) {
        removeBtn.addEventListener('click', () => removeItem(itemEl));
    }
}

function setupGlobalListeners() {
    if (DOM.promoBtn) {
        DOM.promoBtn.addEventListener('click', applyPromo);
    }
    if (DOM.promoInput) {
        DOM.promoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyPromo();
        });
    }
    if (DOM.checkoutBtn) {
        DOM.checkoutBtn.addEventListener('click', checkout);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    restoreQuantities();

    document.querySelectorAll('.cart-item').forEach(itemEl => {
        setupItemListeners(itemEl);
        updateItemTotal(itemEl); // пересчитать сумму на случай, если количество восстановлено
    });

    updateSummary();
    updateItemCount();
    checkEmptyCart();
    setupGlobalListeners();
    saveQuantities();
}

document.addEventListener('DOMContentLoaded', init);
