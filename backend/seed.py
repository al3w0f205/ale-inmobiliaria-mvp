import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Property, User
from django.contrib.gis.geos import Point

# Create a broker user
broker, created = User.objects.get_or_create(
    username="maria_broker",
    defaults={
        "email": "maria@example.com",
        "user_type": User.IS_BROKER,
        "phone_number": "+593 99 123 4567"
    }
)
if created:
    broker.set_password("broker123")
    broker.save()

# Delete existing properties to avoid duplicates in seeding
Property.objects.all().delete()

# Seed properties
Property.objects.create(
    broker=broker,
    title='Casa en el Valle',
    description='Hermosa propiedad con amplio jardín, ideal para familias. Ubicada en una zona tranquila y segura, a solo 10 minutos de centros comerciales y escuelas de prestigio. Cuenta con acabados de lujo, cocina abierta tipo americana, y una pérgola ideal para barbacoas.',
    price=120000.00,
    property_type='casa',
    location=Point(-78.4678, -0.1807), # lon, lat
    tags=['3 Hab', '2 Baños', '150 m²'],
    image_url_fallback='https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
)

Property.objects.create(
    broker=broker,
    title='Departamento moderno',
    description='Centro de la ciudad, espectacular vista y acabados de lujo. Edificio inteligente con gimnasio, piscina y guardianía 24/7. Perfecto para ejecutivos o parejas jóvenes que buscan un estilo de vida urbano.',
    price=85000.00,
    property_type='dep',
    location=Point(-79.9000, -2.1833), # lon, lat
    tags=['2 Hab', '2 Baños', '90 m²'],
    image_url_fallback='https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
)

print("Database seeded successfully with properties!")
