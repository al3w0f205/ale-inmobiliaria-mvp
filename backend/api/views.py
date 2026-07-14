from rest_framework import viewsets, status, permissions
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

User = get_user_model()

from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users only see their own payments
        return self.queryset.filter(broker=self.request.user)

    def perform_create(self, serializer):
        serializer.save(broker=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
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
