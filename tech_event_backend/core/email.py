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
    try:
        # Create a new image with white background
        width, height = 900, 500
        image = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(image)
        
        # Try to load fonts - use default if custom font fails
        try:
            # Adjust these paths to your actual font locations
            title_font = ImageFont.truetype('arial.ttf', 30)
            header_font = ImageFont.truetype('arial.ttf', 24)
            text_font = ImageFont.truetype('arial.ttf', 18)
        except IOError:
            # Use default font if custom font not available
            title_font = ImageFont.load_default()
            header_font = ImageFont.load_default()
            text_font = ImageFont.load_default()
        
        # Add event title
        event_title = ticket.event.title
        draw.text((50, 50), event_title, fill='black', font=title_font)
        
        # Add divider line
        draw.line((50, 100, width-50, 100), fill='black', width=2)
        
        # Add ticket details
        y_position = 120
        details = [
            f"Ticket #: {ticket.ticket_number}",
            f"Attendee: {ticket.user.first_name} {ticket.user.last_name}",
            f"Event Date: {ticket.event.start_date.strftime('%d %b %Y')}",
            f"Time: {ticket.event.start_date.strftime('%I:%M %p')} - {ticket.event.end_date.strftime('%I:%M %p')}",
            f"Location: {ticket.event.location}",
            f"Ticket Type: {ticket.ticket_type}"
        ]
        
        for detail in details:
            draw.text((50, y_position), detail, fill='black', font=text_font)
            y_position += 30
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"TICKET:{ticket.id}")
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_img = qr_img.resize((200, 200))
        
        # Paste QR code onto ticket
        image.paste(qr_img, (width-250, 150))
        
        # Save to in-memory file
        buffer = BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        
        return buffer
    except Exception as e:
        # Log the error
        print(f"Error generating ticket image: {str(e)}")
        
        # Return a basic fallback image instead of None
        fallback = Image.new('RGB', (400, 200), color='white')
        draw = ImageDraw.Draw(fallback)
        font = ImageFont.load_default()
        draw.text((10, 10), f"Ticket: {ticket.ticket_number}", fill='black', font=font)
        draw.text((10, 30), f"Event: {ticket.event.title}", fill='black', font=font)
        
        buffer = BytesIO()
        fallback.save(buffer, format='PNG')
        buffer.seek(0)
        
        return buffer

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
    try:
        ticket_image = generate_ticket_image(ticket)
        if ticket_image:
            encoded_ticket = base64.b64encode(ticket_image.read()).decode()
            
            attachment = Attachment()
            attachment.file_content = FileContent(encoded_ticket)
            attachment.file_type = FileType('image/png')
            attachment.file_name = FileName(f"ticket_{ticket.ticket_number}.png")
            attachment.disposition = Disposition('attachment')
            message.attachment = attachment
    except Exception as e:
        # Log the error but continue to send email without attachment
        print(f"Error attaching ticket image: {str(e)}")
    
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