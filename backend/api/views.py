from rest_framework import viewsets, status, permissions, mixins
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, SAFE_METHODS
from django.db.models import Q
from .models import Property, Subscription, Payment, Message
from .serializers import PropertySerializer, RegisterSerializer, CustomTokenObtainPairSerializer, PaymentSerializer, MessageSerializer
import os
import requests
from django.contrib.auth import get_user_model
from rest_framework.generics import CreateAPIView
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from datetime import timedelta
from django.utils import timezone

User = get_user_model()

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from rest_framework.views import APIView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
                max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
            )
            response.set_cookie(
                key=settings.SIMPLE_JWT['REFRESH_COOKIE'],
                value=refresh_token,
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
                max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
            )
            if 'access' in response.data:
                del response.data['access']
            if 'refresh' in response.data:
                del response.data['refresh']
            
        return response

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # Inject refresh token from cookie into data if not provided
        mutable_data = request.data.copy()
        if 'refresh' not in mutable_data:
            mutable_data['refresh'] = request.COOKIES.get(settings.SIMPLE_JWT['REFRESH_COOKIE'])
        request._full_data = mutable_data
            
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data.get('access')
            response.set_cookie(
                key=settings.SIMPLE_JWT['AUTH_COOKIE'],
                value=access_token,
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                path=settings.SIMPLE_JWT['AUTH_COOKIE_PATH'],
                max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())
            )
            if 'access' in response.data:
                del response.data['access']
            
        return response

class LogoutView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        response = Response({'detail': 'Successfully logged out.'})
        response.delete_cookie(settings.SIMPLE_JWT['AUTH_COOKIE'])
        response.delete_cookie(settings.SIMPLE_JWT['REFRESH_COOKIE'])
        return response

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class IsBrokerOrReadOnly(permissions.BasePermission):
    """
    Permite solo a los corredores (brokers) crear propiedades.
    Permite solo al corredor propietario editar/eliminar la propiedad.
    Las operaciones de solo lectura están permitidas para todos.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and getattr(request.user, 'user_type', '') == User.IS_BROKER

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.broker == request.user

class PropertyViewSet(viewsets.ModelViewSet):
    """
    CRUD para propiedades con seguridad y filtros básicos.
    """
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsBrokerOrReadOnly]

    def get_queryset(self):
        queryset = Property.objects.filter(is_published=True).order_by('-created_at')
        
        # Filtros por query params
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search) | Q(tags__icontains=search)
            )
            
        prop_type = self.request.query_params.get('type', None)
        if prop_type:
            queryset = queryset.filter(property_type=prop_type)
            
        max_price = self.request.query_params.get('max_price', None)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(broker=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        properties = Property.objects.filter(broker=request.user).order_by('-created_at')
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

class PaymentViewSet(mixins.CreateModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins can see all payments
        if self.request.user.is_staff or self.request.user.is_superuser:
            return self.queryset.order_by('-created_at')
        # Users only see their own payments
        return self.queryset.filter(broker=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        payment = self.get_object()
        if payment.status != 'APPROVED':
            payment.status = 'APPROVED'
            payment.save()
            # Activate subscription
            sub, _ = Subscription.objects.get_or_create(broker=payment.broker)
            sub.is_active = True
            sub.save()
            return Response({'status': 'Approved'})
        return Response({'status': 'Already approved'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        payment = self.get_object()
        if payment.status != 'REJECTED':
            payment.status = 'REJECTED'
            payment.save()
            return Response({'status': 'Rejected'})
        return Response({'status': 'Already rejected'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(broker=self.request.user)


class MessageViewSet(mixins.CreateModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can see messages they sent or received
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.receiver == request.user:
            message.is_read = True
            message.save()
            return Response({'status': 'marked as read'})
        return Response({'status': 'unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def payphone_webhook(request):
    # This expects the PayPhone webhook call
    transaction_id = request.data.get('id')
    status_code = request.data.get('statusCode')
    client_tx_id = request.data.get('clientTxId')

    if status_code == 3: # 3 usually means approved in PayPhone
        try:
            # We assume clientTxId corresponds to the payment ID in our DB
            payment = Payment.objects.get(id=client_tx_id)
            if payment.status != 'APPROVED':
                payment.status = 'APPROVED'
                payment.transaction_id = transaction_id
                payment.save()

                sub, _ = Subscription.objects.get_or_create(broker=payment.broker)
                sub.is_active = True
                sub.save()
            return Response({'status': 'ok'})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
            
    return Response({'status': 'ignored'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    Endpoint for PayPhone to initiate a payment securely on backend
    """
    # Create PENDING payment
    payment = Payment.objects.create(
        broker=request.user,
        amount=29.99, # Monthly plan price
        payment_method='PAYPHONE'
    )
    return Response({
        'clientTxId': payment.id,
        'amount': int(payment.amount * 100), # PayPhone expects cents
    })

class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_revenue = Payment.objects.filter(status='APPROVED').aggregate(total=Sum('amount'))['total'] or 0
        total_brokers = User.objects.filter(user_type=User.IS_BROKER).count()
        total_clients = User.objects.filter(user_type=User.IS_CLIENT).count()
        active_subscriptions = Subscription.objects.filter(is_active=True).count()
        published_properties = Property.objects.filter(is_published=True).count()
        pending_payments = Payment.objects.filter(status='PENDING').count()

        return Response({
            'total_revenue': total_revenue,
            'total_brokers': total_brokers,
            'total_clients': total_clients,
            'active_subscriptions': active_subscriptions,
            'published_properties': published_properties,
            'pending_payments': pending_payments,
        })

    @action(detail=False, methods=['get'])
    def chart_data(self, request):
        # Get last 30 days of payments
        thirty_days_ago = timezone.now() - timedelta(days=30)
        daily_revenue = Payment.objects.filter(
            status='APPROVED',
            created_at__gte=thirty_days_ago
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('amount')
        ).order_by('date')

        # Format for recharts
        chart_data = [
            {'date': item['date'].strftime('%d %b'), 'revenue': float(item['revenue'])}
            for item in daily_revenue
        ]

        return Response(chart_data)
