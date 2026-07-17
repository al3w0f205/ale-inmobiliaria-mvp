from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, RegisterView, CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView, PaymentViewSet, MessageViewSet, payphone_webhook, create_payment, AdminDashboardViewSet, AuthMeView, PasswordResetRequestView, PasswordResetConfirmView

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'admin/dashboard', AdminDashboardViewSet, basename='admin-dashboard')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/me/', AuthMeView.as_view(), name='auth_me'),
    path('auth/password-reset-request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('', include(router.urls)),
    path('payment/webhook/', payphone_webhook, name='payphone-webhook'),
    path('payment/create/', create_payment, name='create-payment'),
]

