# events/api/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from events.models import Event
from tickets.models import Ticket
from .serializers import EventSerializer, EventListSerializer, DraftEventSerializer
from core.permissions import IsAdmin, IsOrganizer, IsAdminOrOrganizer
from rest_framework.permissions import IsAuthenticated

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'start_date']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_date', 'ticket_price', 'created_at', 'updated_at']
    ordering = ['-created_at']  # Default ordering
    
    def get_serializer_class(self):
        """Choose serializer based on action and status"""
        if self.action == 'list':
            return EventListSerializer
        elif self.action == 'create':
            # Check if it's a draft creation
            status_val = self.request.data.get('status', 'DRAFT')
            if status_val == 'DRAFT':
                return DraftEventSerializer
        return EventSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminOrOrganizer()]
        elif self.action in ['my_events', 'my_drafts']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        """Filter queryset based on user permissions and action"""
        queryset = Event.objects.select_related('organizer').all()
        
        # For list action, apply visibility rules
        if self.action == 'list':
            if not self.request.user.is_authenticated:
                # Anonymous users only see published events
                queryset = queryset.filter(status='PUBLISHED')
            elif self.request.user.role == 'ADMIN':
                # Admins see all events
                pass
            elif self.request.user.role == 'ORGANIZER':
                # Organizers see published events + their own events
                queryset = queryset.filter(
                    Q(status='PUBLISHED') | Q(organizer=self.request.user)
                ).distinct()
            else:
                # Regular users only see published events
                queryset = queryset.filter(status='PUBLISHED')

        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(location__icontains=search_query) |
                Q(category__icontains=search_query)
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Enhanced create method with better error handling"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Event creation error: {str(e)}")
            
            return Response(
                {
                    'error': 'Failed to create event',
                    'message': str(e) if hasattr(e, 'message') else 'An unexpected error occurred'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_events(self, request):
        """Get current user's events (both drafts and published)"""
        if request.user.role not in ['ADMIN', 'ORGANIZER']:
            return Response(
                {'error': 'Only organizers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.user.role == 'ADMIN':
            events = Event.objects.all()
        else:
            events = Event.objects.filter(organizer=request.user)
        
        # Apply filtering
        status_filter = request.query_params.get('status')
        if status_filter:
            events = events.filter(status=status_filter)
        
        # Apply ordering
        events = events.order_by('-updated_at')
        
        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_drafts(self, request):
        """Get current user's draft events"""
        if request.user.role not in ['ADMIN', 'ORGANIZER']:
            return Response(
                {'error': 'Only organizers can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.user.role == 'ADMIN':    
            drafts = Event.objects.filter(status='DRAFT')
        else:
            drafts = Event.objects.filter(organizer=request.user, status='DRAFT')
        
        drafts = drafts.order_by('-updated_at')
        serializer = EventListSerializer(drafts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminOrOrganizer])
    def publish(self, request, pk=None):
        """Publish a draft event"""
        event = self.get_object()
        
        # Check permissions
        if request.user.role != 'ADMIN' and event.organizer != request.user:
            return Response(
                {'error': 'You can only publish your own events'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if event is in draft status
        if event.status != 'DRAFT':
            return Response(
                {'error': 'Only draft events can be published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate all required fields for publishing
        serializer = EventSerializer(event, data={'status': 'PUBLISHED'}, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(
                {
                    'error': 'Event cannot be published due to validation errors',
                    'errors': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    #event/api/views.py
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrOrganizer])
    def attendees(self, request, pk=None):
        """Get the list of attendees for an event"""
        event = self.get_object()
        
        # Check permissions
        if request.user.role != 'ADMIN' and event.organizer != request.user:
            return Response(
                {"error": "You don't have permission to access this information."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only show attendees for published events
        if event.status != 'PUBLISHED':
            return Response(
                {"error": "Attendee information is only available for published events."},
                status=status.HTTP_400_BAD_REQUEST
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
        try:
            event = self.get_object()
        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if request.user.role not in ['ADMIN', 'ORGANIZER'] or \
        (request.user.role == 'ORGANIZER' and event.organizer != request.user):
            return Response(
                {"error": "You don't have permission to access this information."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Return statistics regardless of event status, but with appropriate data
        if event.status != 'PUBLISHED':
            return Response({
                "message": "Statistics are only available for published events.",
                "total_tickets": 0,
                "sold_tickets": 0,
                "checked_in": 0,
                "available_capacity": event.max_attendees,
                "ticket_types": [],
                "occupancy_rate": 0.0,  # Return as float, not integer
            })
            
        total_tickets = Ticket.objects.filter(event=event).count()
        sold_tickets = Ticket.objects.filter(event=event, payment_status='COMPLETED').count()
        checked_in = Ticket.objects.filter(event=event, checked_in=True).count()
        
        # Ticket type breakdown
        ticket_types = Ticket.objects.filter(event=event, payment_status='COMPLETED') \
                            .values('ticket_type') \
                            .annotate(count=Count('id'))
                            
        # Calculate occupancy rate as float between 0 and 1
        occupancy_rate = (sold_tickets / event.max_attendees) if event.max_attendees > 0 else 0.0
                            
        stats = {
            "total_tickets": total_tickets,
            "sold_tickets": sold_tickets,
            "checked_in": checked_in,
            "available_capacity": max(0, event.max_attendees - sold_tickets),
            "ticket_types": list(ticket_types),
            "occupancy_rate": occupancy_rate,  # This should be float between 0-1
        }
        
        return Response(stats)