# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.api.urls')),
    path('api/events/', include('events.api.urls')),
    path('api/tickets/', include('tickets.api.urls')),
    path('api/payments/', include('payments.api.urls')),
    path('accounts/', include('allauth.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)