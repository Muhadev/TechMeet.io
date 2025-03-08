# core/email.py
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import qrcode
import os

def send_email(to_email, subject, html_content):
    """Helper function to send an email using SendGrid"""
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
    # Create a new image with white background
    width, height = 800, 400
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Load a font (you may need to adjust the path)
    try:
        font_path = os.path.join(settings.BASE_DIR, 'static', 'fonts', 'Arial.ttf')
        font_large = ImageFont.truetype(font_path, 24)
        font_medium = ImageFont.truetype(font_path, 18)
        font_small = ImageFont.truetype(font_path, 14)
    except:
        # Fallback to default font
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw event title
    draw.text((20, 20), ticket.event.title, fill='black', font=font_large)
    
    # Draw ticket info
    draw.text((20, 60), f"Date: {ticket.event.start_date.strftime('%d %b %Y, %H:%M')}", fill='black', font=font_medium)
    draw.text((20, 90), f"Location: {ticket.event.location}", fill='black', font=font_medium)
    draw.text((20, 120), f"Ticket: {ticket.ticket_type}", fill='black', font=font_medium)
    draw.text((20, 150), f"Ticket #: {ticket.ticket_number}", fill='black', font=medium)
    draw.text((20, 180), f"Attendee: {ticket.user.first_name} {ticket.user.last_name}", fill='black', font=font_medium)
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=5,
        border=2
    )
    qr.add_data(str(ticket.id))
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Paste QR code onto ticket
    qr_position = (width - qr_img.size[0] - 20, 20)
    image.paste(qr_img, qr_position)
    
    # Add custom image if available
    if ticket.custom_image:
        try:
            custom_img = Image.open(ticket.custom_image.path)
            custom_img.thumbnail((150, 150))
            custom_position = (width - custom_img.size[0] - 20, 180)
            image.paste(custom_img, custom_position)
        except:
            pass
    
    # Add footer
    draw.text((20, height - 40), "Powered by TechMeet.io", fill='gray', font=font_small)
    
    # Convert to bytes
    buffer = BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    
    return buffer

def send_ticket_confirmation(ticket):
    """Send a confirmation email with the ticket details"""
    user = ticket.user
    event = ticket.event
    
    # Generate the email content
    subject = f"Your Ticket for {event.title}"
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 10px; text-align: center; }}
            .footer {{ background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666; }}
            .ticket-info {{ margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your Ticket is Confirmed!</h1>
            </div>
            
            <p>Dear {user.first_name},</p>
            
            <p>Thank you for purchasing a ticket to <strong>{event.title}</strong>. Your payment has been successfully processed.</p>
            
            <div class="ticket-info">
                <h2>Event Details:</h2>
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {event.start_date.strftime('%A, %d %B %Y')}</p>
                <p><strong>Time:</strong> {event.start_date.strftime('%I:%M %p')} - {event.end_date.strftime('%I:%M %p')}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Ticket Type:</strong> {ticket.ticket_type}</p>
                <p><strong>Ticket Number:</strong> {ticket.ticket_number}</p>
            </div>
            
            <p>Your ticket is attached to this email. Please present the QR code at the venue for entry.</p>
            
            <p>We look forward to seeing you at the event!</p>
            
            <div class="footer">
                <p>© {event.start_date.year} TechMeet.io. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@techmeet.io.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
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
    
    subject = f"Reminder: {event.title} is in {hours_before} hours"
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 10px; text-align: center; }}
            .footer {{ background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666; }}
            .reminder {{ margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Event Reminder</h1>
            </div>
            
            <p>Dear {user.first_name},</p>
            
            <p>This is a friendly reminder that <strong>{event.title}</strong> is happening in {hours_before} hours.</p>
            
            <div class="reminder">
                <h2>Event Details:</h2>
                <p><strong>Event:</strong> {event.title}</p>
                <p><strong>Date:</strong> {event.start_date.strftime('%A, %d %B %Y')}</p>
                <p><strong>Time:</strong> {event.start_date.strftime('%I:%M %p')} - {event.end_date.strftime('%I:%M %p')}</p>
                <p><strong>Location:</strong> {event.location}</p>
            </div>
            
            <p>Don't forget to bring your ticket or have it ready on your mobile device.</p>
            
            <p>We look forward to seeing you at the event!</p>
            
            <div class="footer">
                <p>© {event.start_date.year} TechMeet.io. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@techmeet.io.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user.email, subject, html_content)

def send_password_reset(user, reset_link):
    """Send a password reset email"""
    subject = "Reset Your TechMeet.io Password"
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 10px; text-align: center; }}
            .footer {{ background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #666; }}
            .button {{ display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; 
                      text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            
            <p>Dear {user.first_name},</p>
            
            <p>We received a request to reset your password for your TechMeet.io account. To reset your password, please click the button below:</p>
            
            <p style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </p>
            
            <p>If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>
            
            <p>This link will expire in 24 hours.</p>
            
            <div class="footer">
                <p>© {datetime.now().year} TechMeet.io. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@techmeet.io.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user.email, subject, html_content)