from django.conf import settings
from django.db import models
from catalog.models import Product


class PromoCode(models.Model):
    code = models.CharField(max_length=32, unique=True)
    discount_percent = models.PositiveSmallIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code


class Order(models.Model):
    STATUS_CHOICES = [
        ('processing', 'В обработке'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменён'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def total(self):
        subtotal = sum(item.price * item.quantity for item in self.items.all())
        if self.promo_code:
            subtotal -= subtotal * self.promo_code.discount_percent / 100
        return round(subtotal, 2)

    def __str__(self):
        return f'Заказ №{self.id} — {self.user}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # фиксируем цену на момент заказа
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f'{self.product} × {self.quantity}'