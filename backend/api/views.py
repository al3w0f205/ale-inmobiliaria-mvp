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
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

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

from .serializers import UserProfileSerializer

class AuthMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)
        
    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        queryset = Property.objects.select_related('broker').filter(is_published=True).order_by('-created_at')
        
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
            
        min_bedrooms = self.request.query_params.get('min_bedrooms', None)
        if min_bedrooms:
            queryset = queryset.filter(bedrooms__gte=min_bedrooms)
            
        min_bathrooms = self.request.query_params.get('min_bathrooms', None)
        if min_bathrooms:
            queryset = queryset.filter(bathrooms__gte=min_bathrooms)
            
        min_area = self.request.query_params.get('min_area', None)
        if min_area:
            queryset = queryset.filter(area_sqm__gte=min_area)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(broker=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def broker_stats(self, request):
        if not request.user.is_authenticated or getattr(request.user, 'user_type', '') != User.IS_BROKER:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        properties = Property.objects.filter(broker=request.user)
        total_properties = properties.count()
        total_views = properties.aggregate(total_views=Sum('views_count'))['total_views'] or 0
        total_messages = Message.objects.filter(receiver=request.user).count()

        return Response({
            'total_properties': total_properties,
            'total_views': total_views,
            'total_messages': total_messages
        })

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        properties = Property.objects.select_related('broker').filter(broker=request.user).order_by('-created_at')
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def pois(self, request, pk=None):
        from django.core.cache import cache
        import requests
        import urllib.parse
        
        property_obj = self.get_object()
        lat, lng = property_obj.location.y, property_obj.location.x
        
        cache_key = f"pois_{pk}"
        pois = cache.get(cache_key)
        
        if pois is None:
            query = f"""
            [out:json];
            (
              node["amenity"="hospital"](around:500,{lat},{lng});
              node["amenity"="cafe"](around:500,{lat},{lng});
              node["shop"="supermarket"](around:500,{lat},{lng});
              node["highway"="bus_stop"](around:500,{lat},{lng});
              node["leisure"="park"](around:500,{lat},{lng});
            );
            out body 10;
            """
            url = f"https://overpass-api.de/api/interpreter?data={urllib.parse.quote(query)}"
            try:
                res = requests.get(url, timeout=10)
                data = res.json()
                pois = []
                for el in data.get('elements', []):
                    tags = el.get('tags', {})
                    ptype = 'Lugar'
                    icon = '📍'
                    hexColor = '#ffffff'
                    textColor = 'text-gray-500'
                    bgColor = 'bg-gray-500/10'

                    if tags.get('amenity') == 'hospital': ptype = 'Salud'; icon = '🏥'; hexColor = '#ef4444'; textColor = 'text-red-500'; bgColor = 'bg-red-500/10'
                    if tags.get('amenity') == 'cafe': ptype = 'Cafetería'; icon = '☕'; hexColor = '#f97316'; textColor = 'text-orange-500'; bgColor = 'bg-orange-500/10'
                    if tags.get('shop') == 'supermarket': ptype = 'Supermercado'; icon = '🛒'; hexColor = '#3b82f6'; textColor = 'text-blue-500'; bgColor = 'bg-blue-500/10'
                    if tags.get('highway') == 'bus_stop': ptype = 'Transporte'; icon = '🚌'; hexColor = '#6b7280'; textColor = 'text-gray-600'; bgColor = 'bg-gray-600/10'
                    if tags.get('leisure') == 'park': ptype = 'Parque'; icon = '🌳'; hexColor = '#22c55e'; textColor = 'text-green-500'; bgColor = 'bg-green-500/10'
                    
                    pois.append({
                        'id': el['id'],
                        'lat': el['lat'],
                        'lng': el.get('lon', el.get('lng')),
                        'name': tags.get('name', ptype),
                        'type': ptype,
                        'icon': icon,
                        'hexColor': hexColor,
                        'textColor': textColor,
                        'bgColor': bgColor
                    })
                cache.set(cache_key, pois, 60*60*24) # Cache for 24 hours
            except Exception as e:
                pois = []
                
        return Response(pois)

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
        return Message.objects.select_related('sender', 'receiver').filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-timestamp')

    def perform_create(self, serializer):
        message = serializer.save(sender=self.request.user)
        # Enviar notificación por correo
        receiver = message.receiver
        if receiver.email:
            try:
                frontend_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"
                email_body = f"Hola {receiver.username},\n\nTienes un nuevo mensaje de {self.request.user.username} en Rondira:\n\n\"{message.content}\"\n\nIngresa a tu cuenta para responder:\n{frontend_url}/dashboard"
                
                send_mail(
                    f'Nuevo mensaje de {self.request.user.username} - Rondira',
                    email_body,
                    settings.DEFAULT_FROM_EMAIL,
                    [receiver.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Error enviando notificación de mensaje: {e}")

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

    @action(detail=False, methods=['get'])
    def users(self, request):
        users_qs = User.objects.all().order_by('-date_joined')
        data = [{
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'user_type': u.user_type,
            'is_active': u.is_active,
            'date_joined': u.date_joined.strftime('%d/%m/%Y') if u.date_joined else ''
        } for u in users_qs]
        return Response(data)

    @action(detail=True, methods=['post'])
    def toggle_user_active(self, request, pk=None):
        u = User.objects.get(pk=pk)
        if u == request.user:
            return Response({'error': 'No puedes desactivarte a ti mismo'}, status=status.HTTP_400_BAD_REQUEST)
        u.is_active = not u.is_active
        u.save()
        return Response({'status': 'ok', 'is_active': u.is_active})

    @action(detail=False, methods=['get'])
    def properties(self, request):
        props_qs = Property.objects.all().select_related('broker').order_by('-created_at')
        data = [{
            'id': p.id,
            'title': p.title,
            'price': float(p.price),
            'property_type': p.property_type,
            'is_published': p.is_published,
            'views_count': p.views_count,
            'broker': p.broker.email if p.broker else 'Sin corredor',
            'created_at': p.created_at.strftime('%d/%m/%Y') if p.created_at else ''
        } for p in props_qs]
        return Response(data)

    @action(detail=True, methods=['post'])
    def toggle_property_published(self, request, pk=None):
        p = Property.objects.get(pk=pk)
        p.is_published = not p.is_published
        p.save()
        return Response({'status': 'ok', 'is_published': p.is_published})

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            # Use the first allowed origin (usually the frontend URL in prod)
            frontend_url = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"
            reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            
            message = f"Hola {user.username},\n\nPara restablecer tu contraseña, haz clic en el siguiente enlace:\n\n{reset_url}\n\nSi no solicitaste esto, ignora este correo."
            
            try:
                send_mail(
                    'Restablecer Contraseña - Rondira',
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")
                
        # Always return success even if email not found to prevent user enumeration
        return Response({'message': 'Si tu correo existe en nuestro sistema, hemos enviado un enlace de recuperación.'})

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        if not all([uidb64, token, new_password]):
            return Response({'error': 'Faltan datos.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Contraseña actualizada correctamente.'})
        else:
            return Response({'error': 'El enlace es inválido o ha expirado.'}, status=status.HTTP_400_BAD_REQUEST)
