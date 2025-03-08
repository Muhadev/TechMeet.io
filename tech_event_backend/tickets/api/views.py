# tickets/api/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from tickets.models import Ticket
from events.models import Event
from .serializers import TicketSerializer, TicketPurchaseSerializer, TicketCheckInSerializer
from core.permissions import IsAdmin, IsOrganizer, IsAdminOrOrganizer

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event', 'ticket_type', 'payment_status', 'checked_in']
    search_fields = ['ticket_number', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['purchase_date', 'price_paid']
    
    def get_permissions(self):
        if self.action in ['create', 'purchase', 'list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        elif self.action in ['check_in', 'verify']:
            return [permissions.IsAuthenticated(), IsAdminOrOrganizer()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return Ticket.objects.all()
        elif self.request.user.role == 'ORGANIZER':
            # Organizers can see tickets for events they organize
            return Ticket.objects.filter(event__organizer=self.request.user)
        else:
            # Regular users can only see their own tickets
            return Ticket.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def purchase(self, request):
        """Purchase a ticket for an event"""
        serializer = TicketPurchaseSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            with transaction.atomic():
                # Create the ticket
                ticket = serializer.save()
                
                # Return the ticket information
                return Response(
                    TicketSerializer(ticket, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrOrganizer])
    def check_in(self, request):
        """Check in an attendee using their ticket"""
        serializer = TicketCheckInSerializer(data=request.data)
        
        if serializer.is_valid():
            ticket = serializer.save()
            
            # Return updated ticket data
            return Response(
                TicketSerializer(ticket, context={'request': request}).data,
                status=status.HTTP_200_OK
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_tickets(self, request):
        """Get all tickets for the current user"""
        tickets = Ticket.objects.filter(user=request.user)
        
        # Filter by event if provided
        event_id = request.query_params.get('event_id', None)
        if event_id:
            tickets = tickets.filter(event_id=event_id)
            
        serializer = TicketSerializer(tickets, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrOrganizer])
    def verify(self, request, pk=None):
        """Verify a ticket's validity"""
        try:
            ticket = Ticket.objects.get(id=pk)
            
            # Check if the user is authorized to verify this ticket
            event = ticket.event
            if request.user.role != 'ADMIN' and event.organizer != request.user:
                return Response(
                    {"error": "You don't have permission to verify tickets for this event."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check ticket validity
            valid = ticket.payment_status == 'COMPLETED'
            already_used = ticket.checked_in
            
            response_data = {
                "valid": valid,
                "already_used": already_used,
                "ticket_number": ticket.ticket_number,
                "event": event.title,
                "ticket_type": ticket.ticket_type,
                "user": f"{ticket.user.first_name} {ticket.user.last_name}",
                "user_email": ticket.user.email,
                "custom_image": request.build_absolute_uri(ticket.custom_image.url) if ticket.custom_image else None,
            }
            
            return Response(response_data)
            
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found", "valid": False},
                status=status.HTTP_404_NOT_FOUND
            )