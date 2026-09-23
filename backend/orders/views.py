from rest_framework import viewsets, permissions, views, response, status
from .models import Order, PromoCode
from .serializers import OrderSerializer, PromoCodeCheckSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


class PromoCodeApplyView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PromoCodeCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code'].upper()
        try:
            promo = PromoCode.objects.get(code=code, is_active=True)
            return response.Response({'discount_percent': promo.discount_percent})
        except PromoCode.DoesNotExist:
            return response.Response({'error': 'Промокод не найден'}, status=status.HTTP_404_NOT_FOUND)