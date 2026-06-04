// faq.js - аккордеон для секции часто задаваемых вопросов

document.addEventListener('DOMContentLoaded', function() {
    // Находим все элементы аккордеона на странице
    const accordionItems = document.querySelectorAll('.accordion-item');

    // Если аккордеонов нет на странице, выходим
    if (accordionItems.length === 0) return;

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (!header) return;

        header.addEventListener('click', () => {
            // Закрыть все другие открытые элементы (опционально — для режима "открыт только один")
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Переключить текущий элемент
            item.classList.toggle('active');
        });
    });
});