import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Property, User
from django.contrib.gis.geos import Point
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from io import BytesIO

# Generate a large fake image (e.g. 2000x2000)
large_image = Image.new('RGB', (2000, 2000), color = 'red')
output = BytesIO()
large_image.save(output, format='JPEG', quality=100)
output.seek(0)
image_size = sys.getsizeof(output)

print(f"Original fake image size: {image_size} bytes")

uploaded_img = SimpleUploadedFile("test_huge_image.jpg", output.read(), content_type="image/jpeg")

broker = User.objects.filter(user_type=User.IS_BROKER).first()

prop = Property(
    broker=broker,
    title='Test Property Optimized',
    description='Testing the image optimization.',
    price=99000,
    property_type='casa',
    location=Point(-78.5, -0.2),
    image=uploaded_img
)
prop.save()

# Let's check the size of the saved image
saved_image_path = prop.image.path
optimized_size = os.path.getsize(saved_image_path)
print(f"Optimized saved image size: {optimized_size} bytes")

# Check dimensions
with Image.open(saved_image_path) as img:
    print(f"Optimized image dimensions: {img.size}")

# Cleanup the test property
prop.delete()
