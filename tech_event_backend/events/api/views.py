# events/api/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from events.models import Event
from tickets.models import Ticket
from .serializers import EventSerializer, EventListSerializer
from core.permissions import IsAdmin, IsOrganizer, IsAdminOrOrganizer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'start_date']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_date', 'ticket_price', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminOrOrganizer()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        # If it's a list action and user is not authenticated or not an admin, 
        # only show published events
        if self.action == 'list' and (not self.request.user.is_authenticated or 
                                       self.request.user.role != 'ADMIN'):
            queryset = queryset.filter(status='PUBLISHED')
            
        # If user is an organizer, also show their own events regardless of status
        if self.request.user.is_authenticated and self.request.user.role == 'ORGANIZER':
            queryset = queryset.filter(
                Q(status='PUBLISHED') | Q(organizer=self.request.user)
            ).distinct()
            
        return queryset
    
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrOrganizer])
    def attendees(self, request, pk=None):
        """Get the list of attendees for an event"""
        event = self.get_object()
        
        # Check if the user is the organizer of this event or an admin
        if request.user.role != 'ADMIN' and event.organizer != request.user:
            return Response(
                {"error": "You don't have permission to access this information."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        tickets = Ticket.objects.filter(event=event, payment_status='COMPLETED')
        attendees_data = []
        
        for ticket in tickets:
            attendees_data.append({
                "user_id": ticket.user.id,
                "email": ticket.user.email,
                "name": f"{ticket.user.first_name} {ticket.user.last_name}",
                "ticket_number": ticket.ticket_number,
                "ticket_type": ticket.ticket_type,
                "checked_in": ticket.checked_in,
                "checked_in_time": ticket.checked_in_time,
            })
            
        return Response(attendees_data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for an event"""
        event = self.get_object()
        
        # Check if the user is the organizer of this event or an admin
        if request.user.role not in ['ADMIN', 'ORGANIZER'] or \
           (request.user.role == 'ORGANIZER' and event.organizer != request.user):
            return Response(
                {"error": "You don't have permission to access this information."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        total_tickets = Ticket.objects.filter(event=event).count()
        sold_tickets = Ticket.objects.filter(event=event, payment_status='COMPLETED').count()
        checked_in = Ticket.objects.filter(event=event, checked_in=True).count()
        
        # Ticket type breakdown
        ticket_types = Ticket.objects.filter(event=event, payment_status='COMPLETED') \
                             .values('ticket_type') \
                             .annotate(count=Count('id'))
                             
        stats = {
            "total_tickets": total_tickets,
            "sold_tickets": sold_tickets,
            "checked_in": checked_in,
            "available_capacity": event.max_attendees - sold_tickets,
            "ticket_types": ticket_types,
            "occupancy_rate": (sold_tickets / event.max_attendees * 100) if event.max_attendees > 0 else 0,
        }
        
        return Response(stats)