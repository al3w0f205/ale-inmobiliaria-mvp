from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, RegisterView, CustomTokenObtainPairView, PaymentViewSet, MessageViewSet, payphone_webhook, create_payment, AdminDashboardViewSet
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'admin/dashboard', AdminDashboardViewSet, basename='admin-dashboard')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
    path('payment/webhook/', payphone_webhook, name='payphone-webhook'),
    path('payment/create/', create_payment, name='create-payment'),
]

