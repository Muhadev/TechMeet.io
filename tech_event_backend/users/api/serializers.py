# users/api/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework.validators import UniqueValidator
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from allauth.socialaccount.models import SocialLogin

# Import the Event and Ticket models - adjust the import path as needed
from events.models import Event
from tickets.models import Ticket

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'username', 
                  'profile_picture', 'role', 'auth_provider']
        read_only_fields = ['auth_provider']

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 
                  'last_name', 'username', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    # token = serializers.CharField(required=True)
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'profile_picture']

class CustomSocialLoginSerializer(SocialLoginSerializer):
    """
    Custom social login serializer to handle user creation properly
    """
    def get_social_login(self, adapter, app, token, response):
        """
        Override to ensure proper user creation
        """
        request = self._get_request()
        social_login = adapter.complete_login(request, app, token, response=response)
        social_login.state = SocialLogin.state_from_request(request)
        return social_login

class AttendeeEventSerializer(serializers.ModelSerializer):
    """Serializer for events from attendee perspective"""
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    banner_image_url = serializers.SerializerMethodField()
    event_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location', 'start_date', 'end_date',
            'category', 'banner_image_url', 'ticket_price', 'organizer_name',
            'status', 'event_status'
        ]
    
    def get_banner_image_url(self, obj):
        if obj.banner_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.banner_image.url)
        return None
    
    def get_event_status(self, obj):
        now = timezone.now()
        if obj.start_date > now:
            return 'upcoming'
        elif obj.end_date < now:
            return 'past'
        else:
            return 'ongoing'

class AttendeeTicketSerializer(serializers.ModelSerializer):
    """Serializer for tickets from attendee perspective"""
    event = AttendeeEventSerializer(read_only=True)
    days_until_event = serializers.SerializerMethodField()
    is_event_soon = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'ticket_number', 'ticket_type', 'payment_status',
            'checked_in', 'checked_in_time', 'created_at', 'updated_at',
            'event', 'days_until_event', 'is_event_soon'
        ]
    
    def get_days_until_event(self, obj):
        now = timezone.now()
        if obj.event.start_date > now:
            return (obj.event.start_date - now).days
        return None
    
    def get_is_event_soon(self, obj):
        now = timezone.now()
        if obj.event.start_date > now:
            return (obj.event.start_date - now).days <= 7
        return False

class AttendeeStatisticsSerializer(serializers.Serializer):
    """Serializer for attendee statistics data"""
    overview = serializers.DictField()
    engagement = serializers.DictField()
    financial = serializers.DictField()
    
    def to_representation(self, instance):
        # This ensures consistent formatting of the statistics data
        return {
            'overview': {
                'total_tickets_purchased': instance.get('overview', {}).get('total_tickets_purchased', 0),
                'pending_tickets': instance.get('overview', {}).get('pending_tickets', 0),
                'upcoming_events': instance.get('overview', {}).get('upcoming_events', 0),
                'past_events_attended': instance.get('overview', {}).get('past_events_attended', 0),
                'total_spent': round(instance.get('overview', {}).get('total_spent', 0), 2),
                'attendance_rate': instance.get('overview', {}).get('attendance_rate', 0)
            },
            'engagement': instance.get('engagement', {}),
            'financial': instance.get('financial', {})
        }