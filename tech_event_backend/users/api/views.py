# users/api/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
import sendgrid
from allauth.socialaccount.models import SocialAccount, SocialApp
from .serializers import UserSerializer
from sendgrid.helpers.mail import Mail, Email, To, Content
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, F, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import RedirectView
from django.urls import reverse
from django.http import HttpResponseRedirect
from allauth.socialaccount.providers.oauth2.views import OAuth2Adapter
import requests
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from users.models import OrganizerRequest
from core.email import send_password_reset, send_email
from events.models import Event
import csv
from users.models import User
from tickets.models import Ticket
from decimal import Decimal
from django.template.loader import render_to_string

from .serializers import (
    UserSerializer, RegisterSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, ProfileUpdateSerializer, AttendeeTicketSerializer
    
)

User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.GOOGLE_CALLBACK_URL
    client_class = OAuth2Client

class GithubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    callback_url = settings.GITHUB_CALLBACK_URL
    client_class = OAuth2Client

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                # Generate token
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                
                # Create reset link
                reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
                
                # Send email using the template system
                send_password_reset(user, reset_link)
                
                return Response(
                    {"message": "Password reset link has been sent to your email."},
                    status=status.HTTP_200_OK
                )
            except User.DoesNotExist:
                return Response(
                    {"error": "No user found with this email address."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    serializer_class = PasswordResetConfirmSerializer
    
    def post(self, request, uidb64, token):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
                
                if default_token_generator.check_token(user, token):
                    user.set_password(serializer.validated_data['password'])
                    user.save()
                    
                    # Send confirmation email
                    send_password_reset_success(user)
                    
                    return Response(
                        {"message": "Password has been reset successfully."},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {"error": "Invalid token."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response(
                    {"error": "Invalid user ID."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def send_password_reset_success(user):
    """Send a confirmation email after successful password reset"""
    context = {
        'user': user,
        'year': timezone.now().year,
        'support_email': 'support@techmeet.io'
    }
    
    subject = "Password Reset Successful - TechMeet.io"
    html_content = render_to_string('emails/password_reset_success.html', context)
    
    return send_email(user.email, subject, html_content)

class OAuthTestView(TemplateView):
    template_name = 'auth/oauth_test.html'

class GoogleAuthRedirectView(RedirectView):
    """View to redirect users to Google OAuth authorization URL"""
    
    def get_redirect_url(self, *args, **kwargs):
        # Construct the Google OAuth URL
        redirect_uri = settings.GOOGLE_CALLBACK_URL
        client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
        
        # Construct the authorization URL
        auth_url = (
            f"https://accounts.google.com/o/oauth2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope=profile email&"
            f"access_type=offline"
        )
        return auth_url

class GithubAuthRedirectView(RedirectView):
    """View to redirect users to GitHub OAuth authorization URL"""
    
    def get_redirect_url(self, *args, **kwargs):
        # Construct the GitHub OAuth URL
        redirect_uri = settings.GITHUB_CALLBACK_URL
        client_id = settings.SOCIALACCOUNT_PROVIDERS['github']['APP']['client_id']
        
        # Construct the authorization URL
        auth_url = (
            f"https://github.com/login/oauth/authorize?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"scope=user user:email"
        )
        return auth_url

class GoogleCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        code = request.GET.get('code')
        error = request.GET.get('error')
        
        print(f"Google callback received - Code: {code[:20] if code else None}, Error: {error}")
        
        if error:
            redirect_url = f"{settings.FRONTEND_URL}/auth/google/callback?error=access_denied"
            return HttpResponseRedirect(redirect_url)
            
        if not code:
            redirect_url = f"{settings.FRONTEND_URL}/auth/google/callback?error=no_code"
            return HttpResponseRedirect(redirect_url)
            
        # Get the OAuth2 app details
        try:
            app = SocialApp.objects.get(provider='google')
            client_id = app.client_id
            client_secret = app.secret
        except SocialApp.DoesNotExist:
            print("ERROR: Google SocialApp not found in database")
            redirect_url = f"{settings.FRONTEND_URL}/auth/google/callback?error=config_error"
            return HttpResponseRedirect(redirect_url)
            
        # Exchange the authorization code for an access token
        token_url = 'https://oauth2.googleapis.com/token'
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': settings.GOOGLE_CALLBACK_URL,
            'grant_type': 'authorization_code'
        }
        
        try:
            print(f"Exchanging code for token with redirect_uri: {settings.GOOGLE_CALLBACK_URL}")
            response = requests.post(token_url, data=data)
            
            if response.status_code != 200:
                print(f"Token exchange failed: {response.status_code} - {response.text}")
                redirect_url = f"{settings.FRONTEND_URL}/auth/google/callback?error=token_exchange_failed"
                return HttpResponseRedirect(redirect_url)
                
            # Redirect to frontend with the access token
            token_data = response.json()
            access_token = token_data.get('access_token')
            
            if not access_token:
                print(f"No access token in response: {token_data}")
                redirect_url = f"{settings.FRONTEND_URL}/auth/google/callback?error=no_access_token"
                return HttpResponseRedirect(redirect_url)
                
            print(f"Successfully obtained access token, redirecting to frontend")
            redirect_url = f"{settings.FRONTEND_URL}/auth/google/callback?access_token={access_token}"
            return HttpResponseRedirect(redirect_url)
            
        except Exception as e:
            print(f"Exception during token exchange: {str(e)}")
            redirect_url = f"{settings.FRONTEND_URL}/auth/google/callback?error=server_error"
            return HttpResponseRedirect(redirect_url)

class GithubCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        code = request.GET.get('code')
        error = request.GET.get('error')
        
        print(f"GitHub callback received - Code: {code[:20] if code else None}, Error: {error}")
        
        if error:
            redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?error=access_denied"
            return HttpResponseRedirect(redirect_url)
            
        if not code:
            redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?error=no_code"
            return HttpResponseRedirect(redirect_url)
            
        # Get the OAuth2 app details
        try:
            app = SocialApp.objects.get(provider='github')
            client_id = app.client_id
            client_secret = app.secret
        except SocialApp.DoesNotExist:
            print("ERROR: GitHub SocialApp not found in database")
            redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?error=config_error"
            return HttpResponseRedirect(redirect_url)
            
        # Exchange the authorization code for an access token
        token_url = 'https://github.com/login/oauth/access_token'
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': settings.GITHUB_CALLBACK_URL,
        }
        headers = {'Accept': 'application/json'}
        
        try:
            print(f"Exchanging code for token with redirect_uri: {settings.GITHUB_CALLBACK_URL}")
            response = requests.post(token_url, data=data, headers=headers)
            
            if response.status_code != 200:
                print(f"Token exchange failed: {response.status_code} - {response.text}")
                redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?error=token_exchange_failed"
                return HttpResponseRedirect(redirect_url)
                
            # Redirect to frontend with the access token
            token_data = response.json()
            access_token = token_data.get('access_token')
            
            if not access_token:
                print(f"No access token in response: {token_data}")
                redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?error=no_access_token"
                return HttpResponseRedirect(redirect_url)
                
            print(f"Successfully obtained access token, redirecting to frontend")
            redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?access_token={access_token}"
            return HttpResponseRedirect(redirect_url)
            
        except Exception as e:
            print(f"Exception during token exchange: {str(e)}")
            redirect_url = f"{settings.FRONTEND_URL}/auth/github/callback?error=server_error"
            return HttpResponseRedirect(redirect_url)

class GoogleLoginAPI(APIView):
    permission_classes = []
    
    def post(self, request):
        access_token = request.data.get('access_token')
        
        if not access_token:
            return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use the access token to get user info from Google
            google_user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(google_user_info_url, headers=headers)
            
            if response.status_code != 200:
                return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
            
            user_data = response.json()
            email = user_data.get('email')
            google_id = user_data.get('id')
            
            if not email:
                return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Try to find existing user by email or google provider ID
            user = None
            try:
                user = User.objects.get(email=email)
                # Update auth provider info if it's not set
                if user.auth_provider == 'email':
                    user.auth_provider = 'google'
                    user.auth_provider_id = google_id
                    user.save()
            except User.DoesNotExist:
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    username=email,
                    first_name=user_data.get('given_name', ''),
                    last_name=user_data.get('family_name', ''),
                    auth_provider='google',
                    auth_provider_id=google_id
                )
            
            # Create or update social account for allauth compatibility
            social_account, created = SocialAccount.objects.get_or_create(
                user=user,
                provider='google',
                defaults={'uid': google_id}
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GithubLoginAPI(APIView):
    permission_classes = []
    
    def post(self, request):
        access_token = request.data.get('access_token')
        
        if not access_token:
            return Response({'error': 'Access token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use the access token to get user info from GitHub
            github_user_info_url = 'https://api.github.com/user'
            headers = {'Authorization': f'token {access_token}'}
            response = requests.get(github_user_info_url, headers=headers)
            
            if response.status_code != 200:
                return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
            
            user_data = response.json()
            github_id = str(user_data.get('id'))
            
            # Get user email from GitHub
            email = user_data.get('email')
            if not email:
                # Try to get email from GitHub's email endpoint
                email_response = requests.get('https://api.github.com/user/emails', headers=headers)
                if email_response.status_code == 200:
                    emails = email_response.json()
                    primary_email = next((e['email'] for e in emails if e['primary']), None)
                    email = primary_email
            
            if not email:
                return Response({'error': 'Email not provided by GitHub'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Try to find existing user by email or github provider ID
            user = None
            try:
                user = User.objects.get(email=email)
                # Update auth provider info if it's not set
                if user.auth_provider == 'email':
                    user.auth_provider = 'github'
                    user.auth_provider_id = github_id
                    user.save()
            except User.DoesNotExist:
                # Create new user
                name_parts = (user_data.get('name') or '').split(' ', 1)
                user = User.objects.create_user(
                    email=email,
                    username=email,
                    first_name=name_parts[0] if name_parts else '',
                    last_name=name_parts[1] if len(name_parts) > 1 else '',
                    auth_provider='github',
                    auth_provider_id=github_id
                )
            
            # Create or update social account for allauth compatibility
            social_account, created = SocialAccount.objects.get_or_create(
                user=user,
                provider='github',
                defaults={'uid': github_id}
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#users/api/views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendee_statistics(request):
    """
    Comprehensive statistics for the current attendee user
    """
    user = request.user
    
    # Get current date for filtering
    now = timezone.now()
    
    # Get all user's tickets
    user_tickets = Ticket.objects.filter(user=user)
    completed_tickets = user_tickets.filter(payment_status='COMPLETED')
    
    # Basic ticket counts
    total_tickets = completed_tickets.count()
    pending_tickets = user_tickets.filter(payment_status='PENDING').count()
    
    # Events categorization
    upcoming_events = completed_tickets.filter(
        event__start_date__gt=now,
        event__status='PUBLISHED'
    ).count()
    
    past_events = completed_tickets.filter(
        event__end_date__lt=now,
        event__status__in=['PUBLISHED', 'COMPLETED']
    ).count()
    
    # Check-in statistics
    checked_in_events = completed_tickets.filter(checked_in=True).count()
    
    # Financial statistics
    total_spent = completed_tickets.aggregate(
        total=Sum('event__ticket_price')
    )['total'] or Decimal('0.00')
    
    # Favorite categories (top 3)
    favorite_categories = completed_tickets.values('event__category').annotate(
        count=Count('id')
    ).order_by('-count')[:3]
    
    # Recent activity (last 30 days)
    thirty_days_ago = now - timedelta(days=30)
    recent_tickets = completed_tickets.filter(
        created_at__gte=thirty_days_ago
    ).count()
    
    # Monthly spending trend (last 6 months)
    monthly_spending = []
    for i in range(6):
        month_start = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_spent = completed_tickets.filter(
            created_at__gte=month_start,
            created_at__lte=month_end
        ).aggregate(total=Sum('event__ticket_price'))['total'] or Decimal('0.00')
        
        monthly_spending.append({
            'month': month_start.strftime('%Y-%m'),
            'amount': float(month_spent)
        })
    
    monthly_spending.reverse()  # Most recent first
    
    # Attendance rate (checked in vs total completed tickets)
    attendance_rate = (checked_in_events / total_tickets * 100) if total_tickets > 0 else 0
    
    statistics = {
        'overview': {
            'total_tickets_purchased': total_tickets,
            'pending_tickets': pending_tickets,
            'upcoming_events': upcoming_events,
            'past_events_attended': past_events,
            'total_spent': float(total_spent),
            'attendance_rate': round(attendance_rate, 2)
        },
        'engagement': {
            'events_checked_into': checked_in_events,
            'recent_activity_30_days': recent_tickets,
            'favorite_categories': [
                {
                    'category': cat['event__category'],
                    'count': cat['count']
                } for cat in favorite_categories
            ]
        },
        'financial': {
            'total_spending': float(total_spent),
            'average_ticket_price': float(total_spent / total_tickets) if total_tickets > 0 else 0,
            'monthly_spending_trend': monthly_spending
        }
    }
    
    return Response(statistics)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendee_ticket_history(request):
    """
    Detailed ticket history for the attendee
    """
    user = request.user
    
    # Get query parameters for filtering
    status_filter = request.GET.get('status', None)  # upcoming, past, all
    category_filter = request.GET.get('category', None)
    limit = int(request.GET.get('limit', 20))
    offset = int(request.GET.get('offset', 0))
    
    # Base queryset
    tickets = Ticket.objects.filter(
        user=user,
        payment_status='COMPLETED'
    ).select_related('event', 'event__organizer')
    
    # Apply filters
    now = timezone.now()
    if status_filter == 'upcoming':
        tickets = tickets.filter(event__start_date__gt=now)
    elif status_filter == 'past':
        tickets = tickets.filter(event__end_date__lt=now)
    
    if category_filter:
        tickets = tickets.filter(event__category=category_filter)
    
    # Apply pagination
    total_count = tickets.count()
    tickets = tickets.order_by('-created_at')[offset:offset + limit]
    
    # Serialize data
    serializer = AttendeeTicketSerializer(tickets, many=True, context={'request': request})
    
    return Response({
        'tickets': serializer.data,
        'pagination': {
            'total_count': total_count,
            'limit': limit,
            'offset': offset,
            'has_next': offset + limit < total_count,
            'has_previous': offset > 0
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendee_upcoming_events(request):
    """
    Get upcoming events for the attendee (events they have tickets for)
    """
    user = request.user
    now = timezone.now()
    
    # Get upcoming events where user has completed tickets
    upcoming_tickets = Ticket.objects.filter(
        user=user,
        payment_status='COMPLETED',
        event__start_date__gt=now,
        event__status='PUBLISHED'
    ).select_related('event', 'event__organizer').order_by('event__start_date')
    
    events_data = []
    for ticket in upcoming_tickets:
        event = ticket.event
        
        # Calculate time until event
        time_until = event.start_date - now
        days_until = time_until.days
        
        events_data.append({
            'ticket_id': ticket.id,
            'ticket_number': ticket.ticket_number,
            'ticket_type': ticket.ticket_type,
            'checked_in': ticket.checked_in,
            'event': {
                'id': event.id,
                'title': event.title,
                'location': event.location,
                'start_date': event.start_date,
                'end_date': event.end_date,
                'category': event.category,
                'banner_image': event.banner_image.url if event.banner_image else None,
                'organizer_name': event.organizer.get_full_name(),
            },
            'days_until_event': days_until,
            'is_soon': days_until <= 7  # Event is within a week
        })
    
    return Response({
        'upcoming_events': events_data,
        'total_count': len(events_data)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendee_dashboard_summary(request):
    """
    Quick summary data for attendee dashboard home
    """
    user = request.user
    now = timezone.now()
    
    # Quick counts
    completed_tickets = Ticket.objects.filter(user=user, payment_status='COMPLETED')
    
    next_event_ticket = completed_tickets.filter(
        event__start_date__gt=now,
        event__status='PUBLISHED'
    ).select_related('event').order_by('event__start_date').first()
    
    recent_tickets = completed_tickets.filter(
        created_at__gte=now - timedelta(days=30)
    ).count()
    
    total_spent_this_year = completed_tickets.filter(
        created_at__year=now.year
    ).aggregate(total=Sum('event__ticket_price'))['total'] or Decimal('0.00')
    
    summary = {
        'next_event': None,
        'total_events_attended': completed_tickets.count(),
        'recent_activity_count': recent_tickets,
        'spending_this_year': float(total_spent_this_year)
    }
    
    if next_event_ticket:
        event = next_event_ticket.event
        days_until = (event.start_date - now).days
        
        summary['next_event'] = {
            'title': event.title,
            'location': event.location,
            'start_date': event.start_date,
            'days_until': days_until,
            'ticket_number': next_event_ticket.ticket_number,
            'checked_in': next_event_ticket.checked_in
        }
    
    return Response(summary)
# users/api/views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_analytics(request):
    """
    Comprehensive analytics for organizer users
    """
    user = request.user
    
    # Check if user is an organizer
    if user.role not in ['ORGANIZER', 'ADMIN']:
        return Response(
            {"error": "You don't have permission to access this information."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get period parameter
    period = request.GET.get('period', '6months')
    
    # Calculate date range based on period
    now = timezone.now()
    if period == '1month':
        start_date = now - timedelta(days=30)
    elif period == '3months':
        start_date = now - timedelta(days=90)
    elif period == '6months':
        start_date = now - timedelta(days=180)
    elif period == '1year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=180)  # Default to 6 months
    
    # Base queryset for user's events
    if user.role == 'ADMIN':
        events_queryset = Event.objects.all()
    else:
        events_queryset = Event.objects.filter(organizer=user)
    
    # Filter events by date range
    period_events = events_queryset.filter(created_at__gte=start_date)
    
    # Get tickets for these events
    period_tickets = Ticket.objects.filter(
        event__in=period_events,
        payment_status='COMPLETED'
    )
    
    # Calculate previous period for growth comparison
    previous_start = start_date - (now - start_date)
    previous_events = events_queryset.filter(
        created_at__gte=previous_start,
        created_at__lt=start_date
    )
    previous_tickets = Ticket.objects.filter(
        event__in=previous_events,
        payment_status='COMPLETED'
    )
    
    # Overview calculations
    total_revenue = period_tickets.aggregate(
        total=Sum('event__ticket_price')
    )['total'] or Decimal('0.00')
    
    previous_revenue = previous_tickets.aggregate(
        total=Sum('event__ticket_price')
    )['total'] or Decimal('0.00')
    
    total_tickets_sold = period_tickets.count()
    previous_tickets_sold = previous_tickets.count()
    
    total_events = period_events.count()
    active_events = period_events.filter(
        status='PUBLISHED',
        end_date__gt=now
    ).count()
    
    # Calculate growth percentages
    revenue_growth = 0
    if previous_revenue > 0:
        revenue_growth = float((total_revenue - previous_revenue) / previous_revenue * 100)
    elif total_revenue > 0:
        revenue_growth = 100
    
    ticket_growth = 0
    if previous_tickets_sold > 0:
        ticket_growth = float((total_tickets_sold - previous_tickets_sold) / previous_tickets_sold * 100)
    elif total_tickets_sold > 0:
        ticket_growth = 100
    
    # Monthly revenue data
    monthly_revenue = []
    for i in range(6):  # Last 6 months
        month_start = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        month_tickets = Ticket.objects.filter(
            event__in=events_queryset,
            payment_status='COMPLETED',
            created_at__gte=month_start,
            created_at__lte=month_end
        )
        
        month_revenue = month_tickets.aggregate(
            total=Sum('event__ticket_price')
        )['total'] or Decimal('0.00')
        
        monthly_revenue.append({
            'month': month_start.strftime('%Y-%m'),
            'amount': float(month_revenue)
        })
    
    monthly_revenue.reverse()  # Most recent first
    
    # Event performance data
    event_performance = []
    for event in period_events.filter(status='PUBLISHED')[:10]:  # Top 10 events
        event_tickets = Ticket.objects.filter(
            event=event,
            payment_status='COMPLETED'
        )
        
        tickets_sold = event_tickets.count()
        event_revenue = event_tickets.aggregate(
            total=Sum('event__ticket_price')
        )['total'] or Decimal('0.00')
        
        checked_in_count = event_tickets.filter(checked_in=True).count()
        attendance_rate = (checked_in_count / tickets_sold * 100) if tickets_sold > 0 else 0
        
        event_performance.append({
            'event_title': event.title,
            'tickets_sold': tickets_sold,
            'revenue': float(event_revenue),
            'attendance_rate': round(attendance_rate, 1)
        })
    
    # Sort by revenue
    event_performance.sort(key=lambda x: x['revenue'], reverse=True)
    
    # Category distribution
    category_stats = Ticket.objects.filter(
        event__in=period_events,
        payment_status='COMPLETED'
    ).values('event__category').annotate(
        count=Count('id'),
        revenue=Sum('price_paid')
    ).order_by('-revenue')
    
    category_distribution = []
    for stat in category_stats:
        category_distribution.append({
            'category': stat['category'],
            'count': stat['count'],
            'revenue': float(stat['revenue'] or 0)
        })
    
    # Daily ticket sales (last 30 days)
    daily_sales = []
    for i in range(30):
        date = now.date() - timedelta(days=i)
        day_tickets = period_tickets.filter(
            created_at__date=date
        ).count()
        
        daily_sales.append({
            'date': date.strftime('%Y-%m-%d'),
            'tickets': day_tickets
        })
    
    daily_sales.reverse()  # Chronological order
    
    # Ticket types breakdown
    ticket_types = period_tickets.values('ticket_type').annotate(
        count=Count('id'),
        revenue=Sum('event__ticket_price')
    ).order_by('-count')
    
    ticket_types_data = []
    for ticket_type in ticket_types:
        ticket_types_data.append({
            'type': ticket_type['ticket_type'],
            'count': ticket_type['count'],
            'revenue': float(ticket_type['revenue'] or 0)
        })
    
    # Compile analytics data
    analytics = {
        'overview': {
            'total_revenue': float(total_revenue),
            'total_tickets_sold': total_tickets_sold,
            'total_events': total_events,
            'active_events': active_events,
            'revenue_growth': round(revenue_growth, 2),
            'ticket_growth': round(ticket_growth, 2)
        },
        'revenue': {
            'monthly_revenue': monthly_revenue,
            'total_this_month': float(monthly_revenue[-1]['amount']) if monthly_revenue else 0,
            'total_last_month': float(monthly_revenue[-2]['amount']) if len(monthly_revenue) > 1 else 0
        },
        'events': {
            'event_performance': event_performance,
            'category_distribution': category_distribution
        },
        'tickets': {
            'daily_sales': daily_sales,
            'ticket_types': ticket_types_data
        }
    }
    
    return Response(analytics)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_attendees(request):
    """
    Get attendees for all events organized by the current user
    Supports filtering by event, payment status, check-in status, and search
    """
    user = request.user
    
    # Check if user is organizer
    if user.role != 'ORGANIZER':
        return Response(
            {"error": "You must be an organizer to access this resource."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all events organized by this user
    organizer_events = Event.objects.filter(organizer=user, status='PUBLISHED')
    
    # Base queryset - tickets for organizer's events with completed payments
    tickets_queryset = Ticket.objects.filter(
        event__in=organizer_events
    ).select_related('user', 'event')
    
    # Apply filters
    event_filter = request.GET.get('event')
    if event_filter and event_filter != 'all':
        tickets_queryset = tickets_queryset.filter(event__id=event_filter)
    
    payment_status_filter = request.GET.get('payment_status')
    if payment_status_filter and payment_status_filter != 'all':
        tickets_queryset = tickets_queryset.filter(payment_status=payment_status_filter)
    
    checked_in_filter = request.GET.get('checked_in')
    if checked_in_filter and checked_in_filter != 'all':
        checked_in_bool = checked_in_filter.lower() == 'true'
        tickets_queryset = tickets_queryset.filter(checked_in=checked_in_bool)
    
    # Apply search
    search_query = request.GET.get('search')
    if search_query:
        tickets_queryset = tickets_queryset.filter(
            Q(user__first_name__icontains=search_query) |
            Q(user__last_name__icontains=search_query) |
            Q(user__email__icontains=search_query) |
            Q(ticket_number__icontains=search_query)
        )
    
    # Check if export is requested
    export_format = request.GET.get('export')
    if export_format == 'csv':
        return export_attendees_csv(tickets_queryset)
    
    # Serialize the data
    attendees_data = []
    for ticket in tickets_queryset:
        attendees_data.append({
            "id": str(ticket.id),
            "user_id": ticket.user.id,
            "first_name": ticket.user.first_name,
            "last_name": ticket.user.last_name,
            "email": ticket.user.email,
            "phone": getattr(ticket.user, 'phone', None),  # Assuming phone field exists or is null
            "ticket_number": ticket.ticket_number,
            "ticket_type": ticket.ticket_type,
            "event_title": ticket.event.title,
            "event_date": ticket.event.date.isoformat(),
            "purchase_date": ticket.created_at.isoformat(),
            "checked_in": ticket.checked_in,
            "checked_in_time": ticket.checked_in_time.isoformat() if ticket.checked_in_time else None,
            "payment_status": ticket.payment_status,
        })
    
    return Response({
        "results": attendees_data,
        "count": len(attendees_data)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_attendee_stats(request):
    """
    Get statistics for all attendees across organizer's events
    """
    user = request.user
    
    if user.role != 'ORGANIZER':
        return Response(
            {"error": "You must be an organizer to access this resource."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get organizer's events
    organizer_events = Event.objects.filter(organizer=user, status='PUBLISHED')
    
    # Calculate statistics
    total_tickets = Ticket.objects.filter(event__in=organizer_events)
    completed_tickets = total_tickets.filter(payment_status='COMPLETED')
    
    # Total attendees (completed payments only)
    total_attendees = completed_tickets.count()
    
    # Checked in count
    checked_in_count = completed_tickets.filter(checked_in=True).count()
    
    # Upcoming events attendees (events with future dates)
    upcoming_events = organizer_events.filter(date__gt=timezone.now())
    upcoming_events_attendees = Ticket.objects.filter(
        event__in=upcoming_events,
        payment_status='COMPLETED'
    ).count()
    
    # Recent registrations (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_registrations = completed_tickets.filter(
        created_at__gte=thirty_days_ago
    ).count()
    
    return Response({
        "total_attendees": total_attendees,
        "checked_in_count": checked_in_count,
        "upcoming_events_attendees": upcoming_events_attendees,
        "recent_registrations": recent_registrations
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_events_list(request):
    """
    Get list of events organized by the current user for filtering purposes
    """
    user = request.user
    
    if user.role != 'ORGANIZER':
        return Response(
            {"error": "You must be an organizer to access this resource."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    events = Event.objects.filter(organizer=user).values('id', 'title')
    
    return Response({
        "results": list(events)
    })

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def check_in_attendee(request, ticket_id):
    """
    Check in an attendee for an event
    """
    user = request.user
    
    if user.role != 'ORGANIZER':
        return Response(
            {"error": "You must be an organizer to perform this action."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        ticket = Ticket.objects.select_related('event').get(id=ticket_id)
        
        # Verify the ticket belongs to an event organized by this user
        if ticket.event.organizer != user:
            return Response(
                {"error": "You don't have permission to check in this attendee."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already checked in
        if ticket.checked_in:
            return Response(
                {"error": "Attendee is already checked in."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check in the attendee
        ticket.checked_in = True
        ticket.checked_in_time = timezone.now()
        ticket.save()
        
        return Response({
            "message": "Attendee checked in successfully.",
            "checked_in_time": ticket.checked_in_time.isoformat()
        })
        
    except Ticket.DoesNotExist:
        return Response(
            {"error": "Ticket not found."},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_email_attendees(request):
    """
    Send bulk email to selected attendees
    """
    user = request.user
    
    if user.role != 'ORGANIZER':
        return Response(
            {"error": "You must be an organizer to perform this action."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    attendee_ids = request.data.get('attendee_ids', [])
    email_subject = request.data.get('subject', 'Message from Event Organizer')
    email_message = request.data.get('message', '')
    
    if not attendee_ids:
        return Response(
            {"error": "No attendees selected."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get tickets that belong to this organizer's events
    tickets = Ticket.objects.filter(
        id__in=attendee_ids,
        event__organizer=user
    ).select_related('user', 'event')
    
    if not tickets.exists():
        return Response(
            {"error": "No valid attendees found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Here you would integrate with your email service
    # For now, we'll just return success
    # TODO: Implement actual email sending logic
    
    sent_emails = []
    for ticket in tickets:
        # Add your email sending logic here
        sent_emails.append({
            "email": ticket.user.email,
            "name": f"{ticket.user.first_name} {ticket.user.last_name}",
            "event": ticket.event.title
        })
    
    return Response({
        "message": f"Email sent to {len(sent_emails)} attendees.",
        "sent_to": sent_emails
    })

def export_attendees_csv(tickets_queryset):
    """
    Export attendees data as CSV
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="attendees-{timezone.now().strftime("%Y%m%d")}.csv"'
    
    writer = csv.writer(response)
    
    # Write header
    writer.writerow([
        'Name',
        'Email', 
        'Phone',
        'Event',
        'Event Date',
        'Ticket Number',
        'Ticket Type',
        'Purchase Date',
        'Payment Status',
        'Checked In',
        'Check-in Time'
    ])
    
    # Write data
    for ticket in tickets_queryset:
        writer.writerow([
            f"{ticket.user.first_name} {ticket.user.last_name}",
            ticket.user.email,
            getattr(ticket.user, 'phone', ''),
            ticket.event.title,
            ticket.event.date.strftime('%Y-%m-%d'),
            ticket.ticket_number,
            ticket.ticket_type,
            ticket.created_at.strftime('%Y-%m-%d'),
            ticket.payment_status,
            'Yes' if ticket.checked_in else 'No',
            ticket.checked_in_time.strftime('%Y-%m-%d %H:%M:%S') if ticket.checked_in_time else ''
        ])
    
    return response

# users/api/views.py
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_organizer_role(request):
    """
    Endpoint for users to request promotion from ATTENDEE to ORGANIZER role.
    Requires additional information like organization name and description.
    Admins will need to approve these requests.
    """
    user = request.user
    
    # Check if user is already an organizer or admin
    if user.role in ['ORGANIZER', 'ADMIN']:
        return Response(
            {"error": "You already have organizer or admin privileges."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate required fields
    required_fields = ['organization_name', 'organization_description', 'reason_for_request']
    missing_fields = [field for field in required_fields if field not in request.data]
    
    if missing_fields:
        return Response(
            {"error": f"Missing required fields: {', '.join(missing_fields)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create organizer request
    OrganizerRequest.objects.create(
        user=user,
        organization_name=request.data['organization_name'],
        organization_description=request.data['organization_description'],
        reason_for_request=request.data['reason_for_request'],
        status='PENDING'
    )
    
    return Response(
        {"message": "Your request to become an organizer has been submitted and is pending approval."},
        status=status.HTTP_201_CREATED
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizer_request_status(request):
    """
    Endpoint for users to check the status of their organizer role requests
    """
    user = request.user
    
    # Get the user's most recent request
    try:
        latest_request = OrganizerRequest.objects.filter(user=user).latest('created_at')
        return Response({
            "status": latest_request.status,
            "created_at": latest_request.created_at,
            "updated_at": latest_request.updated_at,
            "admin_notes": latest_request.admin_notes if latest_request.admin_notes else None
        })
    except OrganizerRequest.DoesNotExist:
        return Response(
            {"message": "You haven't made any requests to become an organizer yet."},
            status=status.HTTP_404_NOT_FOUND
        )
# Admin endpoints for managing promotion requests
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_organizer_requests(request):
    """
    Endpoint for admins to view all pending organizer requests
    """
    if request.user.role != 'ADMIN':
        return Response(
            {"error": "Only administrators can access this endpoint."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all pending requests
    requests = OrganizerRequest.objects.filter(status='PENDING')
    data = []
    
    for req in requests:
        data.append({
            "id": req.id,
            "user_id": req.user.id,
            "user_email": req.user.email,
            "user_name": f"{req.user.first_name} {req.user.last_name}",
            "organization_name": req.organization_name,
            "organization_description": req.organization_description,
            "reason_for_request": req.reason_for_request,
            "created_at": req.created_at
        })
    
    return Response(data)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_organizer_request(request, request_id):
    """
    Endpoint for admins to approve an organizer request
    """
    if request.user.role != 'ADMIN':
        return Response(
            {"error": "Only administrators can access this endpoint."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        org_request = OrganizerRequest.objects.get(id=request_id)
        
        # Make sure the request is still pending
        if org_request.status != 'PENDING':
            return Response(
                {"error": f"This request has already been {org_request.status.lower()}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request
        org_request.status = 'APPROVED'
        org_request.admin_notes = request.data.get('admin_notes', '')
        org_request.updated_at = timezone.now()
        org_request.save()
        
        # Update the user's role
        user = org_request.user
        user.role = 'ORGANIZER'
        user.save()
        
        # TODO: Send email notification to user
        
        return Response(
            {"message": f"User {user.email} has been promoted to ORGANIZER role."}
        )
        
    except OrganizerRequest.DoesNotExist:
        return Response(
            {"error": "Request not found."},
            status=status.HTTP_404_NOT_FOUND
        )

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_organizer_request(request, request_id):
    """
    Endpoint for admins to reject an organizer request
    """
    if request.user.role != 'ADMIN':
        return Response(
            {"error": "Only administrators can access this endpoint."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        org_request = OrganizerRequest.objects.get(id=request_id)
        
        # Make sure the request is still pending
        if org_request.status != 'PENDING':
            return Response(
                {"error": f"This request has already been {org_request.status.lower()}."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request
        org_request.status = 'REJECTED'
        org_request.admin_notes = request.data.get('admin_notes', '')
        org_request.updated_at = timezone.now()
        org_request.save()
        
        # TODO: Send email notification to user
        
        return Response(
            {"message": f"The organizer request for user {org_request.user.email} has been rejected."}
        )
        
    except OrganizerRequest.DoesNotExist:
        return Response(
            {"error": "Request not found."},
            status=status.HTTP_404_NOT_FOUND
        )