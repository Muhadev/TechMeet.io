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
from sendgrid.helpers.mail import Mail, Email, To, Content
from django.shortcuts import render
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import RedirectView
from django.urls import reverse
from django.http import HttpResponseRedirect
from allauth.socialaccount.providers.oauth2.views import OAuth2Adapter
from allauth.socialaccount.models import SocialApp
import requests
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from users.models import OrganizerRequest

from .serializers import (
    UserSerializer, RegisterSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, ProfileUpdateSerializer
)

User = get_user_model()

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
    # authentication_classes = []
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
                print(f"DEBUG - Reset link: {reset_link}")  # Add this line
                
                # Send email via SendGrid
                sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
                from_email = Email(settings.DEFAULT_FROM_EMAIL)
                to_email = To(email)
                subject = "Password Reset Request"
                content = Content(
                    "text/plain", 
                    f"Please click the following link to reset your password: {reset_link}"
                )
                mail = Mail(from_email, to_email, subject, content)
                response = sg.client.mail.send.post(request_body=mail.get())
                
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
    authentication_classes = []  # Add this line to disable authentication for this view
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

# Add this new view
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

# Add these imports

class GoogleCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({"error": "No authorization code provided"}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        # Get the OAuth2 app details
        try:
            app = SocialApp.objects.get(provider='google')
            client_id = app.client_id
            client_secret = app.secret
        except SocialApp.DoesNotExist:
            return Response({"error": "Google OAuth configuration not found"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Exchange the authorization code for an access token
        token_url = 'https://oauth2.googleapis.com/token'
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': settings.GOOGLE_CALLBACK_URL,
            'grant_type': 'authorization_code'
        }
        
        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            return Response({"error": "Failed to obtain access token", 
                           "details": response.text}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        # Redirect to frontend with the token
        token_data = response.json()
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={token_data.get('access_token')}"
        return HttpResponseRedirect(redirect_url)

class GithubCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({"error": "No authorization code provided"}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        # Get the OAuth2 app details
        try:
            app = SocialApp.objects.get(provider='github')
            client_id = app.client_id
            client_secret = app.secret
        except SocialApp.DoesNotExist:
            return Response({"error": "GitHub OAuth configuration not found"}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Exchange the authorization code for an access token
        token_url = 'https://github.com/login/oauth/access_token'
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': settings.GITHUB_CALLBACK_URL,
        }
        headers = {'Accept': 'application/json'}
        
        response = requests.post(token_url, data=data, headers=headers)
        if response.status_code != 200:
            return Response({"error": "Failed to obtain access token", 
                           "details": response.text}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        # Redirect to frontend with the token
        token_data = response.json()
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={token_data.get('access_token')}"
        return HttpResponseRedirect(redirect_url)

# users/api/views.py
# Move these functions outside the class
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