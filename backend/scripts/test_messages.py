import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, Message
from rest_framework.test import APIClient

client_user = User.objects.exclude(username='maria_broker').last()
broker = User.objects.filter(username='maria_broker').first()

client = APIClient()
client.force_authenticate(user=client_user)

resp = client.post('/api/messages/', {
    'receiver': broker.id,
    'content': 'Test message from Juan to Maria'
}, format='json')

print("Send message status:", resp.status_code)
if resp.status_code == 201:
    print("Message sent successfully")
else:
    print("Error:", resp.data)

client.force_authenticate(user=broker)
resp = client.get('/api/messages/')
print("Maria Inbox:", len(resp.data), "messages")
for msg in resp.data:
    print(f"- {msg['sender_name']}: {msg['content']} (Read: {msg['is_read']})")
