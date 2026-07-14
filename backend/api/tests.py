from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from .models import Property, Subscription

User = get_user_model()

class MVPTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testbroker', password='123', user_type=User.IS_BROKER)
        self.subscription = Subscription.objects.create(broker=self.user, is_active=True, max_properties=5)

    def test_user_creation(self):
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(self.user.user_type, 'broker')

    def test_subscription_creation(self):
        self.assertEqual(Subscription.objects.count(), 1)
        self.assertTrue(self.subscription.is_active)

