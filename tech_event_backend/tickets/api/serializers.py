# tickets/api/serializers.py
from rest_framework import serializers
from tickets.models import Ticket
from events.models import Event
from events.api.serializers import EventSerializer
from users.api.serializers import UserSerializer
from django.utils import timezone
from django.db import transaction

class TicketSerializer(serializers.ModelSerializer):
    event_details = EventSerializer(source='event', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'event', 'event_details', 'user', 'user_details', 'ticket_number',
            'qr_code', 'ticket_type', 'purchase_date', 'price_paid', 'payment_status',
            'checked_in', 'checked_in_time', 'custom_image', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'ticket_number', 'qr_code', 'purchase_date', 
            'checked_in', 'checked_in_time', 'created_at', 'updated_at'
        ]
    
    def validate_event(self, event):
        # Check if the event exists and is published
        if event.status != 'PUBLISHED':
            raise serializers.ValidationError("This event is not available for ticket purchases")
            
        # Check if the event has already occurred
        if event.start_date < timezone.now():
            raise serializers.ValidationError("Cannot purchase tickets for past events")
            
        # Check if the event is sold out
        if Ticket.objects.filter(event=event).count() >= event.max_attendees:
            raise serializers.ValidationError("This event is sold out")
            
        return event
    
    def create(self, validated_data):
        # Set the user to the current user
        validated_data['user'] = self.context['request'].user
        
        # Set price_paid to the event's ticket price if not provided
        if 'price_paid' not in validated_data:
            validated_data['price_paid'] = validated_data['event'].ticket_price
        
        return super().create(validated_data)

class TicketPurchaseSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    ticket_type = serializers.ChoiceField(choices=Ticket.TICKET_TYPES)
    custom_image = serializers.ImageField(required=False)
    
    def validate_event_id(self, event_id):
        try:
            event = Event.objects.get(id=event_id, status='PUBLISHED')
            
            # Check if the event has already occurred
            if event.start_date < timezone.now():
                raise serializers.ValidationError("Cannot purchase tickets for past events")
                
            # Check if the event is sold out
            if Ticket.objects.filter(event=event).count() >= event.max_attendees:
                raise serializers.ValidationError("This event is sold out")
                
            return event_id
        except Event.DoesNotExist:
            raise serializers.ValidationError("Event not found or not available")
    
    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        event = Event.objects.get(id=validated_data['event_id'])
        
        # Create the ticket
        ticket = Ticket(
            event=event,
            user=user,
            ticket_type=validated_data['ticket_type'],
            price_paid=event.ticket_price,
            payment_status='PENDING'  # Will be updated by payment process
        )
        
        if 'custom_image' in validated_data:
            ticket.custom_image = validated_data['custom_image']
            
        ticket.save()
        return ticket

class TicketCheckInSerializer(serializers.Serializer):
    ticket_id = serializers.UUIDField()
    
    def validate_ticket_id(self, ticket_id):
        try:
            ticket = Ticket.objects.get(id=ticket_id)
            
            # Check if the ticket is already checked in
            if ticket.checked_in:
                raise serializers.ValidationError("Ticket already checked in")
                
            # Check if the ticket payment is completed
            if ticket.payment_status != 'COMPLETED':
                raise serializers.ValidationError("Ticket payment not completed")
                
            return ticket_id
        except Ticket.DoesNotExist:
            raise serializers.ValidationError("Ticket not found")
    
    def create(self, validated_data):
        ticket = Ticket.objects.get(id=validated_data['ticket_id'])
        ticket.checked_in = True
        ticket.checked_in_time = timezone.now()
        ticket.save()
        return ticket