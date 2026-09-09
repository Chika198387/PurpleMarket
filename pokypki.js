// pokypki.js

document.addEventListener('DOMContentLoaded', function() {

    // ===== КНОПКА "ПОВТОРИТЬ" =====
    const repeatBtns = document.querySelectorAll('.repeat-btn');
    repeatBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.purchase-item');
            const itemName = item.querySelector('.item-name').textContent;
            const itemPrice = item.querySelector('.item-price').textContent;

            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            showNotification(`🔄 "${itemName}" добавлен в корзину за ${itemPrice}`, 'success');
            updateCartBadge(1);
        });
    });

    // ===== КНОПКА "ОТЗЫВ" =====
    const reviewBtns = document.querySelectorAll('.review-btn');
    reviewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.purchase-item');
            const itemName = item.querySelector('.item-name').textContent;

            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);

            showReviewModal(itemName, this);
        });
    });

    // ===== МОДАЛЬНОЕ ОКНО ДЛЯ ОТЗЫВА =====
    function showReviewModal(itemName, triggerBtn) {
        const oldModal = document.querySelector('.review-modal-overlay');
        if (oldModal) oldModal.remove();

        const overlay = document.createElement('div');
        overlay.className = 'review-modal-overlay';
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
        modal.className = 'review-modal';
        modal.style.cssText = `
            background: linear-gradient(145deg, #1A0533, #2D1040);
            border: 1px solid rgba(123, 44, 191, 0.3);
            border-radius: 24px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
            animation: slideUp 0.4s ease;
            color: #E0D6F5;
        `;

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="font-size: 22px; color: #fff; margin: 0;">✍️ Отзыв о товаре</h2>
                <button class="modal-close" style="
                    background: none;
                    border: none;
                    color: #9D4EDD;
                    font-size: 32px;
                    cursor: pointer;
                    transition: color 0.3s;
                    line-height: 1;
                ">&times;</button>
            </div>
            <p style="color: #C77DFF; margin-bottom: 20px; font-size: 14px;">Товар: <strong style="color: #fff;">${itemName}</strong></p>

            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #C77DFF; margin-bottom: 8px;">Оценка</label>
                <div class="rating-stars" style="display: flex; gap: 8px; font-size: 32px; cursor: pointer;">
                    <span data-rating="1" style="color: #4A2A5A; transition: color 0.2s;">★</span>
                    <span data-rating="2" style="color: #4A2A5A; transition: color 0.2s;">★</span>
                    <span data-rating="3" style="color: #4A2A5A; transition: color 0.2s;">★</span>
                    <span data-rating="4" style="color: #4A2A5A; transition: color 0.2s;">★</span>
                    <span data-rating="5" style="color: #4A2A5A; transition: color 0.2s;">★</span>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #C77DFF; margin-bottom: 8px;">Текст отзыва</label>
                <textarea class="review-text" placeholder="Поделитесь впечатлениями о товаре..." style="
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 2px solid #7B2CBF;
                    background: rgba(16, 0, 43, 0.5);
                    color: #E0D6F5;
                    font-size: 14px;
                    font-family: 'Montserrat', sans-serif;
                    resize: vertical;
                    min-height: 100px;
                    transition: all 0.3s;
                "></textarea>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="cancel-review" style="
                    padding: 10px 24px;
                    border-radius: 10px;
                    border: 2px solid #7B2CBF;
                    background: transparent;
                    color: #C77DFF;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Montserrat', sans-serif;
                    transition: all 0.3s;
                ">Отмена</button>
                <button class="submit-review" style="
                    padding: 10px 28px;
                    border-radius: 10px;
                    border: none;
                    background: linear-gradient(135deg, #7B2CBF, #9D4EDD);
                    color: #fff;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: 'Montserrat', sans-serif;
                    transition: all 0.3s;
                ">Отправить</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        function closeModal() {
            overlay.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => overlay.remove(), 300);
        }

        overlay.querySelector('.modal-close').addEventListener('click', closeModal);
        overlay.querySelector('.cancel-review').addEventListener('click', closeModal);

        overlay.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });

        const stars = overlay.querySelectorAll('.rating-stars span');
        let selectedRating = 0;

        stars.forEach(star => {
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                stars.forEach(s => {
                    const r = parseInt(s.dataset.rating);
                    s.style.color = r <= rating ? '#FFD166' : '#4A2A5A';
                });
            });

            star.addEventListener('mouseleave', function() {
                stars.forEach(s => {
                    const r = parseInt(s.dataset.rating);
                    s.style.color = r <= selectedRating ? '#FFD166' : '#4A2A5A';
                });
            });

            star.addEventListener('click', function() {
                selectedRating = parseInt(this.dataset.rating);
                stars.forEach(s => {
                    const r = parseInt(s.dataset.rating);
                    s.style.color = r <= selectedRating ? '#FFD166' : '#4A2A5A';
                });
            });
        });

        overlay.querySelector('.submit-review').addEventListener('click', function() {
            const reviewText = overlay.querySelector('.review-text').value.trim();

            if (selectedRating === 0) {
                showNotification('⚠️ Пожалуйста, поставьте оценку!', 'warning');
                return;
            }

            if (!reviewText) {
                showNotification('⚠️ Напишите текст отзыва!', 'warning');
                return;
            }

            this.textContent = '⏳ Отправка...';
            this.disabled = true;

            setTimeout(() => {
                closeModal();
                showNotification(`✅ Спасибо за отзыв на "${itemName}"! Оценка: ${selectedRating}★`, 'success');

                if (triggerBtn) {
                    triggerBtn.textContent = '✅ Отзыв отправлен';
                    triggerBtn.disabled = true;
                    triggerBtn.style.opacity = '0.6';
                    triggerBtn.style.cursor = 'default';
                }
            }, 1000);
        });
    }

    // ===== УВЕДОМЛЕНИЯ (TOAST) =====
    function showNotification(message, type = 'success') {
        const oldToast = document.querySelector('.toast-notification');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;

        let icon = '✅';
        if (type === 'warning') icon = '⚠️';
        if (type === 'error') icon = '❌';
        if (type === 'info') icon = 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

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

        const typeStyles = {
            success: { borderLeft: '4px solid #00D4AA' },
            warning: { borderLeft: '4px solid #FFB347' },
            error: { borderLeft: '4px solid #FF3B5C' },
            info: { borderLeft: '4px solid #7B2CBF' }
        };

        if (typeStyles[type]) {
            toast.style.borderLeft = typeStyles[type].borderLeft;
        }

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

        const styleSheet = document.querySelector('#toast-styles-pokypki');
        if (!styleSheet) {
            const newStyle = document.createElement('style');
            newStyle.id = 'toast-styles-pokypki';
            newStyle.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(newStyle);
        }

        document.body.appendChild(toast);

        setTimeout(function() {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(function() { toast.remove(); }, 300);
            }
        }, 5000);

        toast.addEventListener('click', function(e) {
            if (e.target !== closeBtn) {
                toast.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(function() { toast.remove(); }, 300);
            }
        });
    }

    // ===== ОБНОВЛЕНИЕ БЕЙДЖА КОРЗИНЫ =====
    function updateCartBadge(increment = 0) {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            let current = parseInt(badge.textContent) || 0;
            current += increment;
            badge.textContent = current;

            badge.style.transform = 'scale(1.4)';
            badge.style.transition = 'transform 0.2s';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // ===== СТАТИСТИКА ПО ВЫБРАННЫМ ТОВАРАМ =====
    function updateSummaryStats() {
        const allItems = document.querySelectorAll('.purchase-item');
        const selectedItems = Array.from(allItems).filter(
            item => item.querySelector('.item-checkbox')?.checked
        );

        let totalSum = 0;
        let deliveredCount = 0;
        let inTransitCount = 0;

        selectedItems.forEach(item => {
            const priceText = item.querySelector('.item-price').textContent;
            const priceNum = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
            totalSum += priceNum;

            const statusEl = item.querySelector('.purchase-status');
            if (statusEl && statusEl.classList.contains('status-delivered')) {
                deliveredCount++;
            } else {
                inTransitCount++;
            }
        });

        const countEl = document.getElementById('stat-selected-count');
        const totalEl = document.getElementById('stat-total-spent');
        const deliveredEl = document.getElementById('stat-delivered');
        const transitEl = document.getElementById('stat-in-transit');

        if (countEl) countEl.textContent = selectedItems.length;
        if (totalEl) totalEl.textContent = `${totalSum.toLocaleString('ru-RU')} ₽`;
        if (deliveredEl) deliveredEl.textContent = deliveredCount;
        if (transitEl) transitEl.textContent = inTransitCount;
    }

    // ===== ГЕНЕРАЦИЯ PDF ЧЕКА (по выбранным товарам, ускоренная) =====
    function generateReceiptPDF() {
        return new Promise((resolve, reject) => {
            const selectedItems = Array.from(document.querySelectorAll('.purchase-item'))
                .filter(item => item.querySelector('.item-checkbox')?.checked);

            if (selectedItems.length === 0) {
                reject(new Error('no-selection'));
                return;
            }

            const receiptContainer = document.createElement('div');
            receiptContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: -9999px;
                width: 700px;
                padding: 40px;
                background: #ffffff;
                color: #1a0533;
                font-family: Arial, Helvetica, sans-serif;
            `;

            const orderDate = new Date().toLocaleDateString('ru-RU');

            let itemsHTML = '';
            let totalSum = 0;

            selectedItems.forEach((item, index) => {
                const name = item.querySelector('.item-name').textContent;
                const priceText = item.querySelector('.item-price').textContent;
                const date = item.querySelector('.purchase-date').textContent.replace('📅', '').trim();
                const status = item.querySelector('.purchase-status').textContent.replace('✅', '').trim();

                const priceNum = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
                totalSum += priceNum;

                itemsHTML += `
                    <tr>
                        <td style="padding:10px 8px;border-bottom:1px solid #ddd;">${index + 1}</td>
                        <td style="padding:10px 8px;border-bottom:1px solid #ddd;">${name}</td>
                        <td style="padding:10px 8px;border-bottom:1px solid #ddd;">${date}</td>
                        <td style="padding:10px 8px;border-bottom:1px solid #ddd;">${status}</td>
                        <td style="padding:10px 8px;border-bottom:1px solid #ddd;text-align:right;">${priceText}</td>
                    </tr>
                `;
            });

            receiptContainer.innerHTML = `
                <div style="text-align:center;margin-bottom:30px;">
                    <h1 style="font-size:28px;margin:0;color:#7B2CBF;">Purple Market</h1>
                    <p style="margin:6px 0 0;color:#666;font-size:13px;">Чек по выбранным заказам от ${orderDate}</p>
                </div>
                <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
                    <thead>
                        <tr style="background:#f0e6fa;">
                            <th style="padding:10px 8px;text-align:left;">#</th>
                            <th style="padding:10px 8px;text-align:left;">Товар</th>
                            <th style="padding:10px 8px;text-align:left;">Дата</th>
                            <th style="padding:10px 8px;text-align:left;">Статус</th>
                            <th style="padding:10px 8px;text-align:right;">Цена</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHTML}</tbody>
                </table>
                <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:2px solid #7B2CBF;padding-top:10px;">
                    <tr>
                        <td style="padding:6px 8px;">Выбрано товаров</td>
                        <td style="padding:6px 8px;text-align:right;font-weight:700;">${selectedItems.length}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 8px;">Итого</td>
                        <td style="padding:6px 8px;text-align:right;font-weight:700;">${totalSum.toLocaleString('ru-RU')} ₽</td>
                    </tr>
                </table>
                <p style="margin-top:30px;font-size:11px;color:#999;text-align:center;">
                    © 2025 Purple Market — пружинные костюмы из вселенной FNAF
                </p>
            `;

            document.body.appendChild(receiptContainer);

            html2canvas(receiptContainer, {
                scale: 1,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: false
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = pageWidth - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
                pdf.save(`Purple_Market_Chek_${Date.now()}.pdf`);
                receiptContainer.remove();
                resolve();
            }).catch(err => {
                receiptContainer.remove();
                reject(err);
            });
        });
    }

    // ===== КНОПКА "СКАЧАТЬ ЧЕК" =====
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            this.textContent = '⏳ Генерация...';
            this.disabled = true;

            generateReceiptPDF()
                .then(() => {
                    this.textContent = '✅ Чек скачан!';
                    this.style.background = 'linear-gradient(135deg, #00D4AA, #00B894)';

                    showNotification('📄 Ваш чек скачан', 'success');

                    setTimeout(() => {
                        this.textContent = '📄 Скачать чек';
                        this.disabled = false;
                        this.style.background = '';
                    }, 2000);
                })
                .catch(err => {
                    this.textContent = '📄 Скачать чек';
                    this.disabled = false;

                    if (err.message === 'no-selection') {
                        showNotification('⚠️ Выберите хотя бы один товар', 'warning');
                    } else {
                        console.error('Ошибка генерации чека:', err);
                        showNotification('❌ Не удалось сформировать чек', 'error');
                    }
                });
        });
    }

    // ===== КНОПКА "ВЫБРАТЬ ВСЕ" =====
    const selectAllBtn = document.getElementById('selectAllBtn');
    const allCheckboxes = document.querySelectorAll('.item-checkbox');

    function refreshSelectAllLabel() {
        const allChecked = allCheckboxes.length > 0 &&
            Array.from(allCheckboxes).every(cb => cb.checked);
        if (selectAllBtn) {
            selectAllBtn.textContent = allChecked ? '⬜ Снять все' : '☑️ Выбрать все';
        }
    }

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            allCheckboxes.forEach(cb => { cb.checked = !allChecked; });
            updateSummaryStats();
            refreshSelectAllLabel();
        });
    }

    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSummaryStats();
            refreshSelectAllLabel();
        });
    });

    // Начальное состояние: чекбоксы пусты, статистика и кнопка "Выбрать все" — по нулям
    updateSummaryStats();
    refreshSelectAllLabel();

    // ===== ПОИСК (ХЕДЕР) =====
    const searchInput = document.querySelector('.search');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    showNotification(`🔍 Поиск: "${query}"`, 'info');
                } else {
                    showNotification('⚠️ Введите запрос для поиска', 'warning');
                }
            }
        });
    }

    // ===== ПЛАВНАЯ АНИМАЦИЯ КАРТОЧЕК ПРИ НАВЕДЕНИИ =====
    const purchaseItems = document.querySelectorAll('.purchase-item');
    purchaseItems.forEach(item => {
        item.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        item.style.transform = 'translateX(0)';
        item.style.background = 'transparent';
        item.style.borderRadius = '12px';
        item.style.boxShadow = 'none';
        item.style.padding = '16px';
        item.style.margin = '0';

        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(6px) scale(1.01)';
            this.style.background = 'rgba(123, 44, 191, 0.05)';
            this.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.3), 0 0 40px rgba(123, 44, 191, 0.04)';
            this.style.borderRadius = '14px';
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
            this.style.background = 'transparent';
            this.style.boxShadow = 'none';
            this.style.borderRadius = '12px';
        });
    });

    // ===== ПЛАВНАЯ АНИМАЦИЯ ДЛЯ СТРОК СТАТИСТИКИ =====
    const summaryRows = document.querySelectorAll('.summary-row');
    summaryRows.forEach(row => {
        row.style.transition = 'all 0.35s ease';
        row.style.padding = '10px 0';
        row.style.borderRadius = '8px';
        row.style.margin = '0';
        row.style.background = 'transparent';

        row.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(123, 44, 191, 0.08)';
            this.style.padding = '10px 14px';
            this.style.margin = '0 -14px';
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 2px 12px rgba(123, 44, 191, 0.06)';
        });

        row.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.padding = '10px 0';
            this.style.margin = '0';
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });

    // ===== ПЛАВНАЯ АНИМАЦИЯ ДЛЯ КНОПОК =====
    const allButtons = document.querySelectorAll('.action-btn, .checkout-btn, .continue-shopping, .select-all-btn');
    allButtons.forEach(btn => {
        btn.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    // ===== ПРИВЕТСТВИЕ =====
    console.log('🟣 Purple Market — Страница "Мои покупки" загружена');
    console.log('📦 Всего покупок: 3');

    // ===== ЭФФЕКТ ДЛЯ КАРТИНОК =====
    const itemImages = document.querySelectorAll('.item-image');
    itemImages.forEach(img => {
        img.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 6px 25px rgba(123, 44, 191, 0.25)';
        });

        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });

});