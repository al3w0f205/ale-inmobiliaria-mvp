from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys

class User(AbstractUser):
    """
    Modelo de usuario personalizado.
    Distingue entre clientes y corredores inmobiliarios.
    """
    IS_BROKER = 'broker'
    IS_CLIENT = 'client'
    
    USER_TYPE_CHOICES = [
        (IS_BROKER, 'Corredor'),
        (IS_CLIENT, 'Cliente'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default=IS_CLIENT)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class Subscription(models.Model):
    """
    Control de suscripción de corredores para listar propiedades.
    Se actualizará a través de la API de Payphone.
    """
    broker = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    is_active = models.BooleanField(default=False)
    max_properties = models.IntegerField(default=5) # Límite inicial de anuncios
    valid_until = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"Suscripción de {self.broker.username} - Activa: {self.is_active}"


class Payment(models.Model):
    """
    Control de pagos manuales (DeUna, Transferencia) y automáticos (Payphone).
    """
    PAYMENT_METHODS = [
        ('PAYPHONE', 'Payphone (Tarjeta)'),
        ('DEUNA', 'DeUna'),
        ('TRANSFER', 'Transferencia Bancaria'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pendiente de Revisión'),
        ('APPROVED', 'Aprobado'),
        ('REJECTED', 'Rechazado'),
    ]

    broker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID del pago en Payphone o Referencia Bancaria")
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True, help_text="Comprobante de pago para métodos manuales")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pago {self.id} - {self.broker.username} - {self.status}"


from django.contrib.postgres.fields import ArrayField

class Property(models.Model):
    """
    Anuncio inmobiliario con capacidades de PostGIS.
    """
    PROPERTY_TYPES = [
        ('casa', 'Casa'),
        ('dep', 'Departamento'),
        ('terreno', 'Terreno'),
        ('local', 'Local Comercial'),
    ]

    broker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES, default='casa')
    
    # Image field (for phase 3, but define it now)
    image = models.ImageField(upload_to='properties/', null=True, blank=True)
    image_url_fallback = models.URLField(blank=True, null=True, help_text="Fallback URL if image is not uploaded yet")
    
    # Postgres ArrayField for tags like ['Venta', '3 Cuartos']
    tags = ArrayField(models.CharField(max_length=50), blank=True, default=list)

    # Campo geográfico de PostGIS
    location = models.PointField(srid=4326) # WGS 84
    
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.image:
            # Open the image using Pillow
            img = Image.open(self.image)
            # Convert to RGB if it's RGBA (e.g. PNG with transparency)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            # Resize image to max 1200x800 if larger
            img.thumbnail((1200, 800), Image.Resampling.LANCZOS)
            # Save it to a BytesIO object
            output = BytesIO()
            img.save(output, format='JPEG', quality=75, optimize=True)
            output.seek(0)
            # Change the imagefield value to the compressed one
            self.image = InMemoryUploadedFile(
                output, 'ImageField', 
                f"{self.image.name.split('.')[0]}.jpg", 
                'image/jpeg', sys.getsizeof(output), None
            )
        super(Property, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - ${self.price}"


class Message(models.Model):
    """
    Historial de chat entre usuarios.
    """
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"De {self.sender.username} a {self.receiver.username} ({self.timestamp})"

