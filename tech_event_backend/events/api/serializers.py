# events/api/serializers.py
from rest_framework import serializers
from events.models import Event
from users.api.serializers import UserSerializer
from django.utils import timezone

class EventSerializer(serializers.ModelSerializer):
    organizer_details = UserSerializer(source='organizer', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'organizer', 'organizer_details',
            'location', 'start_date', 'end_date', 'category', 'banner_image',
            'max_attendees', 'ticket_price', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'organizer']
    
    def validate(self, data):
        """Custom validation that considers draft vs published status"""
        status = data.get('status', 'DRAFT')
        
        # For published events, enforce strict validation
        if status == 'PUBLISHED':
            required_fields = ['title', 'description', 'location', 'start_date', 'end_date', 'category']
            missing_fields = []
            
            for field in required_fields:
                if not data.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                raise serializers.ValidationError({
                    'status': f'Cannot publish event. Missing required fields: {", ".join(missing_fields)}'
                })
            
            # Validate dates for published events
            if data.get('start_date') and data.get('end_date'):
                if data['end_date'] <= data['start_date']:
                    raise serializers.ValidationError({
                        'end_date': 'End date must be after start date'
                    })
                
                if data['start_date'] <= timezone.now():
                    raise serializers.ValidationError({
                        'start_date': 'Start date must be in the future'
                    })
            
            # Validate attendee capacity
            max_attendees = data.get('max_attendees')
            if max_attendees is not None and max_attendees < 1:
                raise serializers.ValidationError({
                    'max_attendees': 'Must allow at least 1 attendee'
                })
            
            # Validate ticket price
            ticket_price = data.get('ticket_price')
            if ticket_price is not None and ticket_price < 0:
                raise serializers.ValidationError({
                    'ticket_price': 'Ticket price cannot be negative'
                })
        
        # For drafts, only validate basic required fields
        elif status == 'DRAFT':
            basic_required = ['title', 'description', 'category']
            missing_basic = []
            
            for field in basic_required:
                if not data.get(field) or (isinstance(data.get(field), str) and not data.get(field).strip()):
                    missing_basic.append(field)
            
            if missing_basic:
                raise serializers.ValidationError({
                    'non_field_errors': f'Even drafts require: {", ".join(missing_basic)}'
                })
        
        return data
    
    def create(self, validated_data):
        """Create event with proper user assignment"""
        user = self.context['request'].user
        
        # Check user permissions
        if user.role not in ['ADMIN', 'ORGANIZER']:
            raise serializers.ValidationError({
                'non_field_errors': 'Only admins or organizers can create events'
            })
        
        # Set the organizer to the current user
        validated_data['organizer'] = user
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update event with status change handling"""
        user = self.context['request'].user
        
        # Check if user can modify this event
        if user.role != 'ADMIN' and instance.organizer != user:
            raise serializers.ValidationError({
                'non_field_errors': 'You can only modify your own events'
            })
        
        # Handle status changes
        new_status = validated_data.get('status', instance.status)
        old_status = instance.status
        
        # Prevent certain status transitions
        if old_status == 'PUBLISHED' and new_status == 'DRAFT':
            raise serializers.ValidationError({
                'status': 'Cannot change published event back to draft'
            })
        
        if old_status in ['COMPLETED', 'CANCELLED'] and new_status != old_status:
            raise serializers.ValidationError({
                'status': f'Cannot change status from {old_status}'
            })
        
        return super().update(instance, validated_data)

class EventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing events"""
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'location', 'start_date', 'end_date',
            'category', 'banner_image', 'ticket_price', 'status',
            'organizer_name', 'created_at', 'max_attendees'
        ]

class DraftEventSerializer(serializers.ModelSerializer):
    """Serializer specifically for draft events with minimal validation"""
    organizer_details = UserSerializer(source='organizer', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'organizer', 'organizer_details',
            'location', 'start_date', 'end_date', 'category', 'banner_image',
            'max_attendees', 'ticket_price', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'organizer']
    
    def validate(self, data):
        """Minimal validation for drafts"""
        # Only require the absolute basics
        if not data.get('title') or not data.get('title').strip():
            raise serializers.ValidationError({'title': 'Title is required'})
        
        if not data.get('description') or not data.get('description').strip():
            raise serializers.ValidationError({'description': 'Description is required'})
        
        if not data.get('category'):
            raise serializers.ValidationError({'category': 'Category is required'})
        
        # Ensure status is DRAFT
        data['status'] = 'DRAFT'
        
        return data
