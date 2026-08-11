const API = {
    BASE_URL: 'http://locallocalhost:8000/api/',
    ENDPOINTS: {
        PRODUCTS: 'products/',
        FAVORITES: 'favorites/',
        CART: 'cart/',
        CART_ITEMS: 'cart-items/',
        CATEGORIES: 'categories/',
        SEARCH: 'search/'
    },

    HEADERS: {
        'Content-Type': 'aplication/json',
    }
};

const state = {
    products: [],

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

    searchQery: '',

    filters: {
        categories: [],
        priceMin: null,
        priceMax: null,
        rating: null,
        inStock: false
    },

    isLoading: false
};

const DOM = {
    // контейнеры
    grid: document.getElementById('productsGrid'),
    filters: document.getElementById('filtersPanel'),
    pagination: document.getElementById('pagination'),
    pageNumbers: document.getElementById('pageNumbers'),


    // Кнопки
    gridViewBtn: document.getElementById('gridViewBtn'),
    listViewBtn: document.getElementById('listViewBtn'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    applyFiltersBtn: document.getElementById('applyFiltersBtn'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Поля ввода
    searchInput: document.getElementById('.search'),
    priceMin: document.getElementById('priceMin'),
    priceMax: document.getElementById('priceMax'),
    inStockOnly: document.getElementById('inStockOnly'),

    // Счётчики и индикаторы
    itemCount: document.getElementById('itemCount'),
    cartBadge: document.getElementById('cartBadge'),

    // Группы фильтров
    categoryChecks: document.querySelectorAll('#categoryFilters input[type="checkbox"]'),
    ratingRadios: document.querySelectorAll('#ratingFilters input[type="radio"]'),
    sortSelect: document.getElementById('sortSelect')
};

async function apiRequest(endpoint, options = {}) {
    const url = API.BASE_URL + endpoint;
    const config = {
        headers: API.HEADERS,
        ...options
    }; 
    
    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Ошибка ${response.status}: ${respose.statusText}');
    
            
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Загрузка товаров с пагинацией, фильтрацией и сортировкой.
 * 
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {string} params.sort - Поле сортировки
 * @param {string} params.search - Поисковый запрос
 * @param {Array} params.categories - Массив категорий
 * @param {number} params.price_min - Минимальная цена
 * @param {number} params.price_max - Максимальная цена
 * @param {number} params.rating - Минимальный рейтинг
 * @param {boolean} params.in_stock - Только в наличии
 */

async function fetchProducts(params = {}) {
    state.isLoading = true;
    
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    if (params.sort) queryParams.append('sort', params.sort);

    if (params.search) queryParams.append('search', params.search);

    if (params.categories && params.categories.length) {
        queryParams.append('categories', params.categories.join(','));
    }
    if (params.price_min) queryParams.append('price_min', params.price_min);
    if (params.price_max) queryParams.append('price_max', params.price_max);
    if (params.rating) queryParams.append('rating', params.rating);
    if (params.in_stock) queryParams.append('in_stock', 'true');

    try {
        const url = API.ENDPOINTS.PRODUCTS + '?' + queryParams.toString();
        const data = await apiRequest(url);

        state.products = data.results || data.items || data;
        state.pagination.totalItems = data.count || data.total || state.products.length;
        state.pagination.currentPage = params.page || 1;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / (params.per_page || 8));
        state.pagination.itemsPerPage = params.per_page || 8;

        return state.products;
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showNotification('Не удалось загрузить товары', 'error');
        return [];
    } finally {
        state.isLoading = false;
    }
}

async function fetchFavorites() {
    try {
        const data = await apiRequest(API.ENDPOINTS.FAVORITES);

        const ids = data.map(item => item.id || item);
        state.favorites = new Set(ids);
        return state.favorites;
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        return new Set();
    }
}
/**
@param {number} productId - ID товара
@param {boolean} add - true = добавить, false = удалить
*/
async function toggleFavorite(productId, add) {
    try {
        if (add) {
            await apiRequest(API.ENDPOINTS.FAVORITES, {
                method: 'POST',
                body: JSON.stringify({product_id: productId})
            });
        } else {
            await apiRequest(`${API.ENDPOINTS.FAVORITES}${productId}/`, {
                method: 'DELETE'
            });
        }
        return true;
    } catch (error) {
        console.error('Ошибка изменения избранного:', error);
        showNotification('Не удалось обновить избранное', 'error');
        return false;
    }
}

async function fetchCart() {
    try {
        const data = await apiRequest(API.ENDPOINTS.CART_ITEMS);
        state.cart = new Map(data.map(item => [item.product_id, item.quantity]));
        return state.cart;
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        return new Map();
    }
}

/**
 * @param {number} productId - ID товара
 * @param {number} quantity
 */
async function addToCart(productId, quantity = 1) {
    try {
        await apiRequest(API.ENDPOINTS.CART_ITEMS, {
            method: 'POST',
            body: JSON.stringify({product_id: productId, quantity})
        });

        if (state.cart.has(productId)) {
            state.cart.set(productId, state.cart.get(productId) + quantity);
        } else {
            state.cart.set(productId, quantity);
        }

        return true;
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        showNotification('Не удалось добавить товар в корзину', 'error');
        return false;
    }
}

/**
 * @param {number} productId
 * @param {number} quantity
 */

async function removeFromCart(productId, quantity = null) {
    try {
        const currentQuantity = state.cart.get(productId) || 0;

        if (quantity === null || quantity >= currentQuantity) {
            await apiRequest(`${API.ENDPOINTS.CART_ITEMS}${productId}/`, {
                method: 'DELETE'
            });
            state.cart.delete(productId);
        } else {
            await apiRequest(`${API.ENDPOINTS.CART_ITEMS}${productId}/`, {
                method: 'PATCH',
                body: JSON.stringify({quantity: currentQuantity - quantity})
            });
            state.cart.set(productId, currentQuantity - quantity);
        }

        return true;
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        return [];
    }
}

async function loadAllData() {
    showLoader(true);

    try {
        const [products, favorites, cart, categories] = await Promise.all([
            fetchProducts(buildQueryParams()),
            fetchFavites(),
            fetchCart(),
            fetchCategories()
        ]);
        updateCategoriesUI(categories);
        
        render();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Не удалось загрузить данные', 'error');
    } finally {
        showLoader(false);
    }
}

function buildQueryParams() {
    return {
        page: state.pagination.currentPage,
        per_page: state.pagination.itemsPerPage,
        sort: state.sortBy,
        search: state.searchQuery || undefined,
        categories: state.filters.categories.length ? state.filters.categories : undefined,
        price_min: state.filters.priceMin || undefined,
        price_max: state.filters.priceMax || undefined,
        rating: state.filters.rating || undefined,
        in_stock: state.filters.inStock || undefined
    };
}


function render() {
    if (state.isLoading) {
        DOM.grid.innerHTML = '<div class="loader">Загрузка...</div>';
        return;
    }
    renderProducts();

    renderPagination();

    updateCounters();

    updateViewMode();

    updateActiveFilters();
}

function renderProducts() {
    const products = state.products;

    if (!products || products.length === 0) {
        DOM.grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:60px 20px;">
                <p style="font-size:48px; margin-bottom:16px;">🔍</p>
                <h3 style="color: #fff; margin-bottom:8px;">Ничего не найдено</h3>
                <p style="color: #9D4EDD;">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
        `;
        return;
    }

    DOM.grid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="card-image-wrapper">
                <div class="card-image" style="background: ${product.image_style || 'linear-gradient(145deg, #2D1040 0%, #3D1A55 40%, #5B2D7A 100%)'};">
                    <img src="${product.image}" alt="${product.name}" style="max-width:80%; max-height:80%; object-fit:contain;">
                </div>
                ${renderBadges(product)}
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
                <p class="card-desc">${product.short_description || product.description || ''}</p>
                <div class="card-price-block">
                    <span class="card-price">${formatPrice(product.price)}</span>
                    ${product.old_price ? `<span class="card-old-price">${formatPrice(product.old_price)}</span>` : ''}
                </div>
                <button class="add-to-cart" data-id="${product.id}" ${!product.in_stock ? 'disabled' : ''}>
                    ${state.cart.has(product.id) ? '✓ В корзине' : '🛒 В корзину'}
                </button>
            </div>
        </div>
    `).join('');
}

function renderBadges(product) {
    let html = '';
    if (product.is_hit) html += `<span class="badge badge-hit">Хит</span>`;
    if (product.discount > 0) html += `<span class="badge badge-discount">-${product.discount}%</span>`;
    if (product.is_new) html += `<span class="badge badge-new">Новинка</span>`;
    return html;
}

function renderStars(rating) {
    if (!rating) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

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
        btn.addEventListener('click', async () => {
            state.pagination.currentPage = parseInt(btn.dataset.page);
            await loadAllData();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function updateCounters() {
    const total = state.pagination.totalItems || state.products.length;
    DOM.itemCount.textContent = `${total} товаров`;

    const totalInCart = Array.from(state.cart.values()).reduce((sum, qty) => sum + qty, 0);
    DOM.cartBadge.textContent = totalInCart;
}

function updateViewMode() {
    if (state.viewMode === 'list') {
        DOM.grid.style.gridTemplateColumns = '1fr';
    } else {
        DOM.grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
    DOM.gridViewBtn.classList.toggle('active', state.viewMode === 'grid');
    DOM.listViewBtn.classList.toggle('active', state.viewMode === 'list');
}

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

function updateCategoriesUI(categories) {
    const container = document.querySelector('#categoryFilters');
    if (!container || !categories || !categories.length) return;

    container.innerHTML = categories.map(cat => `
        <li>
            <label class="filter-check">
                <input type="checkbox" value="${cat.id}" ${state.filters.categories.includes(cat.id) ? 'checked' : ''}>
                ${cat.name}
            </label>
        </li>
    `).join('');

    DOM.categoryChecks = container.querySelectorAll('input[type="checkbox"]');
}

function formatPrice(price) {
    if (!price) return '0 ₽';
    return price.toLocaleString('ru-RU') + ' ₽';
}

function showLoader(show) {
    state.isLoading = show;
}

function showNotification(message, type = 'info') {
    if (type === 'error') {
        console.error(message);
    } else {
        console.log(message);
    }
}


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

async function applyFilters() {
    readFiltersFromUI();
    state.pagination.currentPage = 1;
    await loadAllData();
}

async function resetFilters() {
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

    await loadAllData();
}

let searchTimeout;
function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        state.searchQuery = DOM.searchInput.value;
        state.pagination.currentPage = 1;
        await loadAllData();
    }, 300);
}

DOM.searchInput.addEventListener('input', handleSearch);

DOM.sortSelect.addEventListener('change', async () => {
    state.sortBy = DOM.sortSelect.value;
    state.pagination.currentPage = 1;
    await loadAllData();
});

DOM.gridViewBtn.addEventListener('click', () => {
    state.viewMode = 'grid';
    render();
});
DOM.listViewBtn.addEventListener('click', () => {
    state.viewMode = 'list';
    render();
});

DOM.prevPageBtn.addEventListener('click', async () => {
    if (state.pagination.currentPage > 1) {
        state.pagination.currentPage--;
        await loadAllData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
DOM.nextPageBtn.addEventListener('click', async () => {
    if (state.pagination.currentPage < state.pagination.totalPages) {
        state.pagination.currentPage++;
        await loadAllData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

DOM.applyFiltersBtn.addEventListener('click', applyFilters);
DOM.resetFiltersBtn.addEventListener('click', resetFilters);

DOM.grid.addEventListener('click', async (e) => {
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) {
        const id = parseInt(favBtn.dataset.id);
        const add = !state.favorites.has(id);
        const success = await toggleFavorite(id, add);
        
        if (success) {
            if (add) {
                state.favorites.add(id);
            } else {
                state.favorites.delete(id);
            }
            render();
        }
        return;
    }

    const cartBtn = e.target.closest('.add-to-cart');
    if (cartBtn) {
        const id = parseInt(cartBtn.dataset.id);
        const product = state.products.find(p => p.id === id);

        if (!product || !product.in_stock) {
            showNotification('Товара нет в наличии', 'error');
            return;
        }

        const success = await addToCart(id);
        if (success) {
            render();
            showNotification('Товар добавлен в корзину', 'success');
        }
        return;
    }
});

async function init() {
    console.log('Каталог запущен');

    showLoader(true);

    try {
        await loadAllData();

        console.log('✅ Данные загружены, каталог готов');

    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        showNotification('Не удалось загрузить каталог', 'error');
    } finally {
        showLoader(false);
    }
}

init();