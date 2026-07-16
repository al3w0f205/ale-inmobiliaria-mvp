from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Property, Subscription, Message, Payment
from rest_framework_gis.serializers import GeoFeatureModelSerializer

User = get_user_model()

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'payment_method', 'status', 'transaction_id', 'receipt_image', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Include user type in response
        # Using string 'broker' or 'user' for frontend convenience
        user_type_str = 'broker' if getattr(self.user, 'user_type', '') == User.IS_BROKER else 'user'
        data['user_type'] = user_type_str
        return data

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador de usuarios básicos.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'phone_number']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    broker_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'user_type', 'phone_number', 'broker_code']
        
    def validate(self, attrs):
        user_type = attrs.get('user_type', User.IS_CLIENT)
        if user_type == User.IS_BROKER:
            broker_code = attrs.get('broker_code', '')
            if broker_code != 'VIP2026':
                raise serializers.ValidationError({"broker_code": "Código de invitación de corredor inválido o faltante."})
        return attrs
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            user_type=validated_data.get('user_type', User.IS_CLIENT),
            phone_number=validated_data.get('phone_number', '')
        )
        return user

from rest_framework_gis.fields import GeometryField

class BrokerSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='username')
    phone = serializers.CharField(source='phone_number')
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'phone', 'average_rating', 'review_count']

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews_received.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg is not None else 0.0

    def get_review_count(self, obj):
        return obj.reviews_received.count()

class PropertySerializer(serializers.ModelSerializer):
    """
    Serializador de propiedades usando DRF estándar. 
    Se usa GeometryField para que devuelva location en formato GeoJSON.
    """
    broker = BrokerSerializer(read_only=True)
    location = GeometryField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ['id', 'title', 'description', 'price', 'property_type', 'location', 'tags', 'image', 'image_url', 'broker', 'is_published', 'created_at']
        extra_kwargs = {
            'image': {'write_only': True}
        }

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        if obj.image_url_fallback:
            return obj.image_url_fallback
        return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'

class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializador para suscripciones de Payphone.
    """
    class Meta:
        model = Subscription
        fields = ['id', 'is_active', 'max_properties', 'valid_until']


