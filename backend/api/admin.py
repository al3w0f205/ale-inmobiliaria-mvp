from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import User, Property, Subscription, Message, Payment

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'user_type')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'broker', 'amount', 'payment_method', 'status', 'created_at')
    list_filter = ('status', 'payment_method')
    actions = ['approve_payments']

    def approve_payments(self, request, queryset):
        for payment in queryset:
            if payment.status != 'APPROVED':
                payment.status = 'APPROVED'
                payment.save()
                # Activate broker subscription
                sub, _ = Subscription.objects.get_or_create(broker=payment.broker)
                sub.is_active = True
                sub.save()
        self.message_user(request, f"Se han aprobado {queryset.count()} pagos y activado las suscripciones.")
    approve_payments.short_description = "Aprobar Pagos Seleccionados (Activa Suscripción)"
