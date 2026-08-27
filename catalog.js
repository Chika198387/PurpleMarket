// ===== СОСТОЯНИЕ =====
const state = {
    products: [],
    filteredProducts: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 8
    },
    favorites: new Set(),
    cart: new Map(),
    viewMode: 'grid',
    sortBy: 'popular',
    searchQuery: '',
    filters: {
        categories: [],
        priceMin: null,
        priceMax: null,
        rating: null,
        inStock: false
    },
    isLoading: false
};

// ===== DOM ЭЛЕМЕНТЫ =====
const DOM = {
    grid: document.getElementById('productsGrid'),
    filters: document.getElementById('filtersPanel'),
    pagination: document.getElementById('pagination'),
    pageNumbers: document.getElementById('pageNumbers'),
    gridViewBtn: document.getElementById('gridViewBtn'),
    listViewBtn: document.getElementById('listViewBtn'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    applyFiltersBtn: document.getElementById('applyFiltersBtn'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    searchInput: document.getElementById('search'),
    priceMin: document.getElementById('priceMin'),
    priceMax: document.getElementById('priceMax'),
    inStockOnly: document.getElementById('inStockOnly'),
    itemCount: document.getElementById('itemCount'),
    cartBadge: document.getElementById('cartBadge'),
    sortSelect: document.getElementById('sortSelect')
};

// Обновляем categoryChecks и ratingRadios после загрузки DOM
DOM.categoryChecks = document.querySelectorAll('#categoryFilters input[type="checkbox"]');
DOM.ratingRadios = document.querySelectorAll('#ratingFilters input[type="radio"]');

// ===== ЗАГРУЗКА ТОВАРОВ ИЗ HTML =====
function loadProductsFromHTML() {
    const cards = DOM.grid.querySelectorAll('.product-card');
    const products = [];
    
    cards.forEach(card => {
        const id = parseInt(card.dataset.id) || products.length + 1;
        const name = card.querySelector('.card-name')?.textContent || 'Товар';
        const priceText = card.querySelector('.card-price')?.textContent || '0 ₽';
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const oldPriceText = card.querySelector('.card-old-price')?.textContent || '';
        const oldPrice = oldPriceText ? parseInt(oldPriceText.replace(/[^\d]/g, '')) : null;
        const ratingText = card.querySelector('.stars')?.textContent || '★★★★★';
        const rating = ratingText.split('★').length - 1;
        const reviewsText = card.querySelector('.reviews')?.textContent || '(0)';
        const reviews = parseInt(reviewsText.replace(/[^\d]/g, '')) || 0;
        const desc = card.querySelector('.card-desc')?.textContent || '';
        const inStock = !card.querySelector('.add-to-cart')?.disabled;
        const image = card.querySelector('.card-image2 img, .card-image img')?.src || '';
        const isHit = !!card.querySelector('.badge-hit');
        const isNew = !!card.querySelector('.badge-new');
        const discountText = card.querySelector('.badge-discount')?.textContent || '';
        const discount = discountText ? parseInt(discountText.replace(/[^\d]/g, '')) : 0;
        const isFavorite = !!card.querySelector('.fav-btn.active');
        
        let category = 'classic';
        if (name.toLowerCase().includes('deluxe')) category = 'deluxe';
        else if (name.toLowerCase().includes('limited')) category = 'limited';
        else if (name.toLowerCase().includes('restoration')) category = 'restoration';
        
        products.push({
            id,
            name,
            price,
            old_price: oldPrice,
            rating,
            reviews_count: reviews,
            short_description: desc,
            description: desc,
            image,
            in_stock: inStock,
            is_hit: isHit,
            is_new: isNew,
            discount,
            category,
            is_favorite: isFavorite
        });
    });
    
    return products;
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    console.log('Каталог запущен');
    
    state.products = loadProductsFromHTML();
    state.filteredProducts = [...state.products];
    state.pagination.totalItems = state.products.length;
    state.pagination.totalPages = Math.ceil(state.products.length / state.pagination.itemsPerPage);
    
    loadFavoritesFromStorage();
    loadCartFromStorage();
    
    applyFiltersAndRender();
    setupEventListeners();
    
    console.log(`✅ Загружено ${state.products.length} товаров`);
}

// ===== РАБОТА С ИЗБРАННЫМ (localStorage) =====
function loadFavoritesFromStorage() {
    try {
        const saved = localStorage.getItem('favorites');
        if (saved) {
            const ids = JSON.parse(saved);
            state.favorites = new Set(ids);
        }
    } catch (e) {
        console.error('Ошибка загрузки избранного:', e);
    }
}

function saveFavoritesToStorage() {
    try {
        localStorage.setItem('favorites', JSON.stringify([...state.favorites]));
    } catch (e) {
        console.error('Ошибка сохранения избранного:', e);
    }
}

// ===== РАБОТА С КОРЗИНОЙ (localStorage) =====
function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('cart');
        if (saved) {
            const cartData = JSON.parse(saved);
            state.cart = new Map(Object.entries(cartData));
        }
    } catch (e) {
        console.error('Ошибка загрузки корзины:', e);
    }
}

function saveCartToStorage() {
    try {
        const cartObj = Object.fromEntries(state.cart);
        localStorage.setItem('cart', JSON.stringify(cartObj));
    } catch (e) {
        console.error('Ошибка сохранения корзины:', e);
    }
}

// ===== ФИЛЬТРАЦИЯ =====
function applyFiltersAndRender() {
    let filtered = [...state.products];
    
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.short_description.toLowerCase().includes(query)
        );
    }
    
    if (state.filters.categories.length > 0) {
        filtered = filtered.filter(p => 
            state.filters.categories.includes(p.category)
        );
    }
    
    if (state.filters.priceMin !== null) {
        filtered = filtered.filter(p => p.price >= state.filters.priceMin);
    }
    if (state.filters.priceMax !== null) {
        filtered = filtered.filter(p => p.price <= state.filters.priceMax);
    }
    
    if (state.filters.rating !== null) {
        filtered = filtered.filter(p => p.rating >= state.filters.rating);
    }
    
    if (state.filters.inStock) {
        filtered = filtered.filter(p => p.in_stock);
    }
    
    switch (state.sortBy) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'new':
            filtered.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
            break;
        default:
            filtered.sort((a, b) => (b.is_hit ? 1 : 0) - (a.is_hit ? 1 : 0));
            break;
    }
    
    state.filteredProducts = filtered;
    state.pagination.totalItems = filtered.length;
    state.pagination.totalPages = Math.ceil(filtered.length / state.pagination.itemsPerPage);
    
    if (state.pagination.currentPage > state.pagination.totalPages) {
        state.pagination.currentPage = Math.max(1, state.pagination.totalPages);
    }
    
    render();
}

// ===== ОТРИСОВКА =====
function render() {
    renderProducts();
    renderPagination();
    updateCounters();
    updateViewMode();
    updateActiveFilters();
}

// ===== ОСНОВНАЯ ФУНКЦИЯ РЕНДЕРИНГА КАРТОЧЕК =====
function renderProducts() {
    const start = (state.pagination.currentPage - 1) * state.pagination.itemsPerPage;
    const end = start + state.pagination.itemsPerPage;
    const pageProducts = state.filteredProducts.slice(start, end);
    
    if (pageProducts.length === 0) {
        DOM.grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:60px 20px;">
                <p style="font-size:48px; margin-bottom:16px;">🔍</p>
                <h3 style="color: #fff; margin-bottom:8px;">Ничего не найдено</h3>
                <p style="color: #9D4EDD;">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
        `;
        return;
    }
    
    // СОЗДАЕМ КАРТОЧКИ
    let html = '';
    pageProducts.forEach(product => {
        let badgesHtml = '';
        if (product.discount > 0) {
            badgesHtml += `<span class="badge badge-discount">-${product.discount}%</span>`;
        }
        if (product.is_new) {
            badgesHtml += `<span class="badge badge-new">Новинка</span>`;
        }
        if (product.is_hit) {
            badgesHtml += `<span class="badge badge-hit">Хит</span>`;
        }
        
        // Определяем класс для изображения (используем card-image для всех)
        const imageClass = 'card-image';
        
        html += `
        <div class="product-card" data-id="${product.id}">
            <div class="card-image-wrapper">
                <div class="${imageClass}" style="background: linear-gradient(145deg, #2D1040 0%, #3D1A55 40%, #5B2D7A 100%);">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                ${badgesHtml}
                <button class="fav-btn ${state.favorites.has(product.id) ? 'active' : ''}" 
                        data-id="${product.id}" 
                        title="В избранное">
                    ${state.favorites.has(product.id) ? '♥' : '♡'}
                </button>
            </div>
            <div class="card-info">
                <p class="card-rating">
                    <span class="stars">${renderStars(product.rating)}</span>
                    <span class="reviews">${product.rating || 0} (${product.reviews_count || 0})</span>
                </p>
                <h3 class="card-name">${product.name}</h3>
                <p class="card-desc">${product.short_description || ''}</p>
                <div class="card-price-block">
                    <span class="card-price">${formatPrice(product.price)}</span>
                    ${product.old_price ? `<span class="card-old-price">${formatPrice(product.old_price)}</span>` : ''}
                </div>
                <button class="add-to-cart" data-id="${product.id}" ${!product.in_stock ? 'disabled' : ''}>
                    ${state.cart.has(product.id) ? '✓ В корзине' : '🛒 В корзину'}
                </button>
            </div>
        </div>
    `;
    });
    
    DOM.grid.innerHTML = html;
    
    // ПРИНУДИТЕЛЬНО выравниваем высоту после рендеринга
    setTimeout(() => {
        alignCardsHeight();
    }, 50);
}

// ===== ФУНКЦИЯ ДЛЯ ВЫРАВНИВАНИЯ ВЫСОТЫ КАРТОЧЕК =====
function alignCardsHeight() {
    const cards = DOM.grid.querySelectorAll('.product-card');
    if (cards.length === 0) return;
    
    // Сбрасываем высоту
    cards.forEach(card => {
        card.style.height = '';
    });
    
    // Ждем перерисовки
    requestAnimationFrame(() => {
        let maxHeight = 0;
        
        // Находим максимальную высоту
        cards.forEach(card => {
            const height = card.offsetHeight;
            if (height > maxHeight) maxHeight = height;
        });
        
        // Устанавливаем всем одинаковую высоту
        if (maxHeight > 0) {
            cards.forEach(card => {
                card.style.height = maxHeight + 'px';
            });
        }
    });
}

// ===== РЕНДЕРИНГ ЗВЕЗД =====
function renderStars(rating) {
    if (!rating) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ===== РЕНДЕРИНГ ПАГИНАЦИИ =====
function renderPagination() {
    const { currentPage, totalPages } = state.pagination;
    if (totalPages <= 1) {
        DOM.pageNumbers.innerHTML = '';
        DOM.prevPageBtn.disabled = true;
        DOM.nextPageBtn.disabled = true;
        return;
    }

    let html = '';
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
    } else {
        html += `<button class="page-btn ${1 === currentPage ? 'active' : ''}" data-page="1">1</button>`;
        if (currentPage > 3) html += `<span class="page-dots">...</span>`;
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        if (currentPage < totalPages - 2) html += `<span class="page-dots">...</span>`;
        html += `<button class="page-btn ${totalPages === currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
    }

    DOM.pageNumbers.innerHTML = html;
    DOM.prevPageBtn.disabled = currentPage <= 1;
    DOM.nextPageBtn.disabled = currentPage >= totalPages;

    DOM.pageNumbers.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.pagination.currentPage = parseInt(btn.dataset.page);
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ===== ОБНОВЛЕНИЕ СЧЕТЧИКОВ =====
function updateCounters() {
    const total = state.pagination.totalItems || state.filteredProducts.length;
    DOM.itemCount.textContent = `${total} товаров`;
    const totalInCart = Array.from(state.cart.values()).reduce((sum, qty) => sum + qty, 0);
    DOM.cartBadge.textContent = totalInCart;
}

// ===== ВИД ОТОБРАЖЕНИЯ =====
function updateViewMode() {
    if (state.viewMode === 'list') {
        DOM.grid.classList.add('list-view');
    } else {
        DOM.grid.classList.remove('list-view');
    }
    DOM.gridViewBtn.classList.toggle('active', state.viewMode === 'grid');
    DOM.listViewBtn.classList.toggle('active', state.viewMode === 'list');
}

// ===== ОБНОВЛЕНИЕ АКТИВНЫХ ФИЛЬТРОВ =====
function updateActiveFilters() {
    DOM.categoryChecks.forEach(cb => {
        cb.checked = state.filters.categories.includes(cb.value);
    });
    DOM.priceMin.value = state.filters.priceMin || '';
    DOM.priceMax.value = state.filters.priceMax || '';
    DOM.ratingRadios.forEach(r => {
        r.checked = r.value === (state.filters.rating || 'any');
    });
    DOM.inStockOnly.checked = state.filters.inStock;
    DOM.sortSelect.value = state.sortBy;
    DOM.searchInput.value = state.searchQuery;
}

// ===== ФОРМАТИРОВАНИЕ ЦЕНЫ =====
function formatPrice(price) {
    if (!price) return '0 ₽';
    return price.toLocaleString('ru-RU') + ' ₽';
}

// ===== ЧТЕНИЕ ФИЛЬТРОВ ИЗ UI =====
function readFiltersFromUI() {
    const cats = [];
    DOM.categoryChecks.forEach(cb => {
        if (cb.checked) cats.push(cb.value);
    });
    state.filters.categories = cats;
    state.filters.priceMin = parseInt(DOM.priceMin.value) || null;
    state.filters.priceMax = parseInt(DOM.priceMax.value) || null;
    state.filters.inStock = DOM.inStockOnly.checked;
    state.filters.rating = null;
    DOM.ratingRadios.forEach(r => {
        if (r.checked && r.value !== 'any') {
            state.filters.rating = parseInt(r.value);
        }
    });
}

// ===== ПРИМЕНЕНИЕ ФИЛЬТРОВ =====
function applyFilters() {
    readFiltersFromUI();
    state.pagination.currentPage = 1;
    applyFiltersAndRender();
}

function resetFilters() {
    DOM.categoryChecks.forEach(cb => cb.checked = false);
    DOM.priceMin.value = '';
    DOM.priceMax.value = '';
    DOM.inStockOnly.checked = false;
    DOM.ratingRadios.forEach(r => r.checked = r.value === 'any');
    state.filters = { categories: [], priceMin: null, priceMax: null, rating: null, inStock: false };
    state.searchQuery = '';
    state.sortBy = 'popular';
    state.pagination.currentPage = 1;
    DOM.searchInput.value = '';
    DOM.sortSelect.value = 'popular';
    applyFiltersAndRender();
}

// ===== ПОИСК =====
let searchTimeout;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        state.searchQuery = DOM.searchInput.value;
        state.pagination.currentPage = 1;
        applyFiltersAndRender();
    }, 300);
}

// ===== ТОГГЛ ИЗБРАННОГО =====
function toggleFavorite(productId) {
    if (state.favorites.has(productId)) {
        state.favorites.delete(productId);
    } else {
        state.favorites.add(productId);
    }
    saveFavoritesToStorage();
    render();
}

// ===== ДОБАВЛЕНИЕ В КОРЗИНУ =====
function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || !product.in_stock) {
        showNotification('Товара нет в наличии', 'error');
        return;
    }
    const currentQty = state.cart.get(productId) || 0;
    state.cart.set(productId, currentQty + 1);
    saveCartToStorage();
    render();
    showNotification('Товар добавлен в корзину', 'success');
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message, type = 'info') {
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

// ===== НАСТРОЙКА СОБЫТИЙ =====
function setupEventListeners() {
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener('input', handleSearch);
    }
    
    if (DOM.sortSelect) {
        DOM.sortSelect.addEventListener('change', () => {
            state.sortBy = DOM.sortSelect.value;
            state.pagination.currentPage = 1;
            applyFiltersAndRender();
        });
    }
    
    if (DOM.gridViewBtn) {
        DOM.gridViewBtn.addEventListener('click', () => {
            state.viewMode = 'grid';
            updateViewMode();
            // После смены вида выравниваем карточки
            setTimeout(() => alignCardsHeight(), 100);
        });
    }
    if (DOM.listViewBtn) {
        DOM.listViewBtn.addEventListener('click', () => {
            state.viewMode = 'list';
            updateViewMode();
            setTimeout(() => alignCardsHeight(), 100);
        });
    }
    
    if (DOM.prevPageBtn) {
        DOM.prevPageBtn.addEventListener('click', () => {
            if (state.pagination.currentPage > 1) {
                state.pagination.currentPage--;
                render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    if (DOM.nextPageBtn) {
        DOM.nextPageBtn.addEventListener('click', () => {
            if (state.pagination.currentPage < state.pagination.totalPages) {
                state.pagination.currentPage++;
                render();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    if (DOM.applyFiltersBtn) {
        DOM.applyFiltersBtn.addEventListener('click', applyFilters);
    }
    if (DOM.resetFiltersBtn) {
        DOM.resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    if (DOM.grid) {
        DOM.grid.addEventListener('click', (e) => {
            const favBtn = e.target.closest('.fav-btn');
            if (favBtn) {
                const id = parseInt(favBtn.dataset.id);
                toggleFavorite(id);
                return;
            }
            const cartBtn = e.target.closest('.add-to-cart');
            if (cartBtn) {
                const id = parseInt(cartBtn.dataset.id);
                addToCart(id);
                return;
            }
        });
    }
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', init);

// Добавляем обработчик изменения размера окна для пересчета высоты
window.addEventListener('resize', () => {
    setTimeout(() => alignCardsHeight(), 200);
});