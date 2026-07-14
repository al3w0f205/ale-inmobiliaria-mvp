import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User

# Get broker credentials from seed
broker = User.objects.filter(user_type=User.IS_BROKER).first()
if broker:
    # Get JWT token
    login_url = "http://localhost:8000/api/token/"
    # Wait, we don't know the raw password because it's hashed.
    # I'll just use DRF's APIClient in a test script.

    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=broker)
    
    response = client.get('/api/properties/me/')
    print(f"Status Code: {response.status_code}")
    print(f"Data count: {len(response.data)}")
    print("Success" if response.status_code == 200 else "Failed")
else:
    print("No broker found.")
