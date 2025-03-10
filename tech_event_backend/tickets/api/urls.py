# tickets/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet

router = DefaultRouter()
router.register('', TicketViewSet)

urlpatterns = [
    path('', include(router.urls)),
]