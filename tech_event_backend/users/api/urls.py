# users/api/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, 
    UserProfileView, 
    GoogleLoginAPI,
    GithubLoginAPI, 
    GoogleAuthRedirectView,
    GithubAuthRedirectView,
    GoogleCallbackView,
    GithubCallbackView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    OAuthTestView,
    request_organizer_role,
    organizer_request_status,
    list_organizer_requests,
    approve_organizer_request,
    reject_organizer_request,
    organizer_analytics,
    attendee_statistics,
    attendee_ticket_history,
    attendee_upcoming_events,
    attendee_dashboard_summary,
    organizer_attendees,
    organizer_attendee_stats,
    organizer_events_list,
    check_in_attendee,
    bulk_email_attendees,
)

urlpatterns = [
    # JWT endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Registration and profile
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Social authentication - REST API endpoints (POST)
    path('google/', GoogleLoginAPI.as_view(), name='google_login'),
    path('github/', GithubLoginAPI.as_view(), name='github_login'),

    # Social authentication - Redirect views (GET)
    path('google/redirect/', GoogleAuthRedirectView.as_view(), name='google_auth_redirect'),
    path('github/redirect/', GithubAuthRedirectView.as_view(), name='github_auth_redirect'),

    # Social authentication - Callback views (use the new dedicated views)
    path('google/callback/', GoogleCallbackView.as_view(), name='google_callback'),
    path('github/callback/', GithubCallbackView.as_view(), name='github_callback'),
    
    # Password reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # OAuth test page
    path('oauth-test/', OAuthTestView.as_view(), name='oauth_test'),

    # Attendee Dashboard Statistics
    path('attendee/statistics/', attendee_statistics, name='attendee-statistics'),
    path('attendee/ticket-history/', attendee_ticket_history, name='attendee-ticket-history'),
    path('attendee/upcoming-events/', attendee_upcoming_events, name='attendee-upcoming-events'),
    path('attendee/dashboard-summary/', attendee_dashboard_summary, name='attendee-dashboard-summary'),

    # Organizer attendee management
    path('organizer/analytics/', organizer_analytics, name='organizer-analytics'),
    path('organizer/attendees/', organizer_attendees, name='organizer-attendees'),
    path('organizer/attendee-stats/', organizer_attendee_stats, name='organizer-attendee-stats'),
    path('organizer/events/', organizer_events_list, name='organizer-events-list'),
    path('organizer/attendees/<int:ticket_id>/check-in/', check_in_attendee, name='check-in-attendee'),
    path('organizer/attendees/bulk-email/', bulk_email_attendees, name='bulk-email-attendees'),
    
    path('request-organizer/', request_organizer_role, name='request-organizer'),
    path('organizer-request-status/', organizer_request_status, name='organizer-request-status'),
    
    # Admin endpoints for managing requests
    path('admin/organizer-requests/', list_organizer_requests, name='list-organizer-requests'),
    path('admin/organizer-requests/<int:request_id>/approve/', approve_organizer_request, name='approve-organizer-request'),
    path('admin/organizer-requests/<int:request_id>/reject/', reject_organizer_request, name='reject-organizer-request'),
]