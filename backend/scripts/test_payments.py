import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, Payment

broker = User.objects.filter(username='maria_broker').first()
if broker:
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=broker)

    # 1. Test Payphone (create payment)
    resp = client.post('/api/payment/create/')
    print("Create Payphone Payment:", resp.status_code, resp.data)
    
    payphone_payment_id = resp.data['clientTxId']
    
    # Simulate webhook hitting with status 3
    webhook_resp = client.post('/api/payment/webhook/', {
        "id": "123456",
        "statusCode": 3,
        "clientTxId": payphone_payment_id
    }, format='json')
    print("Webhook response:", webhook_resp.status_code, webhook_resp.data)

    # 2. Test manual payment (DeUna/Transfer)
    import io
    from PIL import Image
    
    file_obj = io.BytesIO()
    img = Image.new('RGB', (100, 100), color = 'red')
    img.save(file_obj, 'JPEG')
    file_obj.name = 'test_receipt.jpg'
    file_obj.seek(0)
    
    manual_resp = client.post('/api/payments/', {
        "amount": "29.99",
        "payment_method": "DEUNA",
        "receipt_image": file_obj
    }, format='multipart')
    print("Manual Payment Submit:", manual_resp.status_code, manual_resp.data)

    manual_id = manual_resp.data['id']
    
    print("\nPayments in DB:")
    for p in Payment.objects.all():
        print(f"- ID: {p.id}, Status: {p.status}, Method: {p.payment_method}")

else:
    print("No broker found.")
