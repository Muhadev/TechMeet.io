# users/api/adapters.py
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialLogin
from django.http import HttpResponse
from django.contrib.auth import get_user_model

User = get_user_model()

class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_auto_signup_allowed(self, request, sociallogin):
        # Always allow auto signup for API usage
        return True
    
    def save_user(self, request, sociallogin, form=None):
        """
        Override to handle user creation for social login
        """
        user = sociallogin.user
        if user.id:
            return user
            
        # Auto-populate user fields from social account data
        if sociallogin.account.provider == 'google':
            user.email = sociallogin.account.extra_data.get('email', '')
            user.first_name = sociallogin.account.extra_data.get('given_name', '')
            user.last_name = sociallogin.account.extra_data.get('family_name', '')
        elif sociallogin.account.provider == 'github':
            user.email = sociallogin.account.extra_data.get('email', '')
            name_parts = sociallogin.account.extra_data.get('name', '').split(' ', 1)
            user.first_name = name_parts[0] if name_parts else ''
            user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Set default role for new users
        user.role = 'ATTENDEE'
        user.save()
        return user