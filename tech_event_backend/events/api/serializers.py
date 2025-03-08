# events/api/serializers.py
from rest_framework import serializers
from events.models import Event
from users.api.serializers import UserSerializer

class EventSerializer(serializers.ModelSerializer):
    organizer_details = UserSerializer(source='organizer', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'organizer', 'organizer_details',
            'location', 'start_date', 'end_date', 'category', 'banner_image',
            'max_attendees', 'ticket_price', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        # Ensure the user creating the event is either an admin or organizer
        user = self.context['request'].user
        if user.role not in ['ADMIN', 'ORGANIZER']:
            raise serializers.ValidationError("Only admins or organizers can create events")
        
        # Set the organizer to the current user
        validated_data['organizer'] = user
        
        return super().create(validated_data)

class EventListSerializer(serializers.ModelSerializer):
    """A lightweight serializer for listing events"""
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'location', 'start_date', 'end_date',
            'category', 'banner_image', 'ticket_price', 'status'
        ]