# In core/email.py, modify to use Django's template system
from django.conf import settings
from django.template.loader import render_to_string
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import qrcode
import os
from datetime import datetime

def send_email(to_email, subject, html_content):
    """Helper function to send an email using SendGrid"""
    # No changes needed here
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response
    except Exception as e:
        # Log the error
        print(f"Error sending email: {str(e)}")
        return None

def generate_ticket_image(ticket):
    """Generate an image of the ticket with QR code and user details"""
    # No changes needed here
    # ... existing code ...

def send_ticket_confirmation(ticket):
    """Send a confirmation email with the ticket details"""
    user = ticket.user
    event = ticket.event
    
    # Use Django template instead of inline HTML
    context = {
        'user': user,
        'event': event,
        'ticket': ticket,
        'year': event.start_date.year
    }
    
    subject = f"Your Ticket for {event.title}"
    html_content = render_to_string('emails/ticket_confirmation.html', context)
    
    # Create email
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=user.email,
        subject=subject,
        html_content=html_content
    )
    
    # Generate and attach the ticket image
    ticket_image = generate_ticket_image(ticket)
    encoded_ticket = base64.b64encode(ticket_image.read()).decode()
    
    attachment = Attachment()
    attachment.file_content = FileContent(encoded_ticket)
    attachment.file_type = FileType('image/png')
    attachment.file_name = FileName(f"ticket_{ticket.ticket_number}.png")
    attachment.disposition = Disposition('attachment')
    message.attachment = attachment
    
    # Send the email
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        # Log the error
        print(f"Error sending ticket confirmation: {str(e)}")
        return None

def send_event_reminder(ticket, hours_before=24):
    """Send a reminder email before the event"""
    user = ticket.user
    event = ticket.event
    
    context = {
        'user': user,
        'event': event,
        'hours_before': hours_before,
        'year': event.start_date.year
    }
    
    subject = f"Reminder: {event.title} is in {hours_before} hours"
    html_content = render_to_string('emails/event_reminder.html', context)
    
    return send_email(user.email, subject, html_content)

def send_password_reset(user, reset_link):
    """Send a password reset email"""
    context = {
        'user': user,
        'reset_link': reset_link,
        'year': datetime.now().year
    }
    
    subject = "Reset Your TechMeet.io Password"
    html_content = render_to_string('emails/password_reset.html', context)
    
    return send_email(user.email, subject, html_content)