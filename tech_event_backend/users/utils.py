# users/utils.py
# Create this file to handle email notifications

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_organizer_request_notification(organizer_request):
    """
    Send notification to admins when a new organizer request is submitted
    """
    subject = f'New Organizer Request: {organizer_request.user.email}'
    
    context = {
        'user_email': organizer_request.user.email,
        'user_name': f"{organizer_request.user.first_name} {organizer_request.user.last_name}",
        'organization_name': organizer_request.organization_name,
        'organization_description': organizer_request.organization_description,
        'reason_for_request': organizer_request.reason_for_request,
        'admin_url': f"{settings.FRONTEND_URL}/admin/organizer-requests"
    }
    
    html_message = render_to_string('emails/new_organizer_request.html', context)
    plain_message = strip_tags(html_message)
    
    # Send to admin email address
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [settings.ADMIN_EMAIL],  # You'll need to define this in settings
        html_message=html_message,
        fail_silently=False,
    )

def send_organizer_request_status_update(organizer_request):
    """
    Send notification to user when their organizer request status changes
    """
    subject = f'Your Organizer Request: {organizer_request.status}'
    
    context = {
        'user_name': f"{organizer_request.user.first_name} {organizer_request.user.last_name}",
        'status': organizer_request.status,
        'admin_notes': organizer_request.admin_notes,
        'dashboard_url': f"{settings.FRONTEND_URL}/dashboard"
    }
    
    html_message = render_to_string('emails/organizer_request_update.html', context)
    plain_message = strip_tags(html_message)
    
    # Send to the user who made the request
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [organizer_request.user.email],
        html_message=html_message,
        fail_silently=False,
    )