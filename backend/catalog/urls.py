from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, FavoriteViewSet, ReviewViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('products', ProductViewSet)
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('reviews', ReviewViewSet)

urlpatterns = router.urls