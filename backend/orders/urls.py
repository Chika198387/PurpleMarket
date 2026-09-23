from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, PromoCodeApplyView

router = DefaultRouter()
router.register('orders', OrderViewSet, basename='order')

urlpatterns = router.urls + [
    path('cart/apply-promo/', PromoCodeApplyView.as_view()),
]