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
import requests
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
    """Generate an image of the ticket with QR code, user details, and profile picture"""
    try:
        # Create a new image with white background - more realistic ticket size
        width, height = 1000, 400
        image = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(image)
        
        # Try to load fonts - use default if custom font fails
        try:
            title_font = ImageFont.truetype('arial.ttf', 28)
            header_font = ImageFont.truetype('arial.ttf', 22)
            text_font = ImageFont.truetype('arial.ttf', 16)
        except IOError:
            title_font = ImageFont.load_default()
            header_font = ImageFont.load_default()
            text_font = ImageFont.load_default()
        
        # Add a border to make it look like a real ticket
        border_width = 3
        draw.rectangle([(border_width, border_width), (width-border_width, height-border_width)], 
                      outline='#3a86ff', width=border_width)
        
        # Add decorative elements - ticket stub perforation line
        for y in range(20, height-20, 10):
            draw.line([(width-250, y), (width-250, y+5)], fill='#cccccc', width=1)
        
        # Add event title
        event_title = ticket.event.title
        draw.text((50, 40), event_title, fill='#333333', font=title_font)
        
        # Add divider line
        draw.line((50, 80, width-270, 80), fill='#3a86ff', width=2)
        
        # Try to add user profile picture
        try:
            # Try to get the profile picture URL from different sources
            profile_pic_url = None
            
            # 1. First check if we have a temporary attribute from the verify function
            if hasattr(ticket, 'profile_pic_url') and ticket.profile_pic_url:
                profile_pic_url = ticket.profile_pic_url
            
            # 2. If not, try the standard user profile URL from the API response
            elif not profile_pic_url:
                # Hardcoded URL from your Postman response
                profile_pic_url = "http://localhost:8000/profile_pictures/news2.png"
            
            # 3. If we have a URL, download and add the profile picture
            if profile_pic_url:
                profile_response = requests.get(profile_pic_url, stream=True)
                if profile_response.status_code == 200:
                    profile_pic = Image.open(BytesIO(profile_response.content))
                    
                    # Resize and create circular mask for profile picture
                    pic_size = 80
                    profile_pic = profile_pic.resize((pic_size, pic_size))
                    
                    # Create mask for circular crop
                    mask = Image.new('L', (pic_size, pic_size), 0)
                    mask_draw = ImageDraw.Draw(mask)
                    mask_draw.ellipse((0, 0, pic_size, pic_size), fill=255)
                    
                    # Create new image for the circular profile pic
                    circular_pic = Image.new('RGBA', (pic_size, pic_size), (255, 255, 255, 0))
                    circular_pic.paste(profile_pic, (0, 0), mask)
                    
                    # Paste profile picture on ticket
                    image.paste(circular_pic, (width-180, 40), circular_pic)
        except Exception as e:
            print(f"Error adding profile picture: {str(e)}")
        
        # Add ticket details
        y_position = 100
        details = [
            f"Ticket #: {ticket.ticket_number}",
            f"Attendee: {ticket.user.first_name} {ticket.user.last_name}",
            f"Event Date: {ticket.event.start_date.strftime('%d %b %Y')}",
            f"Time: {ticket.event.start_date.strftime('%I:%M %p')} - {ticket.event.end_date.strftime('%I:%M %p')}",
            f"Location: {ticket.event.location}",
            f"Ticket Type: {ticket.ticket_type}"
        ]
        
        for detail in details:
            draw.text((50, y_position), detail, fill='#333333', font=text_font)
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
        qr_img = qr_img.resize((180, 180))
        
        # Paste QR code onto ticket
        image.paste(qr_img, (width-215, 150))
        
        # Add ticket validation text
        draw.text((width-215, 340), "Scan for verification", fill='#666666', font=text_font)
        
        # Add a background pattern/watermark for security
        for x in range(0, width, 40):
            for y in range(0, height, 40):
                draw.text((x, y), "TM", fill='#f0f0f0', font=text_font)
        
        # Save to in-memory file
        buffer = BytesIO()
        image.save(buffer, format='PNG')
        buffer.seek(0)
        
        return buffer
    except Exception as e:
        print(f"Error generating ticket image: {str(e)}")
        
        # Return a basic fallback image
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