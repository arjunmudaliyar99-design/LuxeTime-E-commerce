"""
Contact API - Email Sending via Gmail SMTP
Handles contact form submissions and sends emails to admin
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic model for contact form validation
class ContactMessage(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="Valid email address")
    phone: str = Field(default="", max_length=20, description="Phone number (optional)")
    message: str = Field(..., min_length=10, max_length=1000, description="Message content")

# Email configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")  # Your Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Gmail App Password
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "arjunmuudaliyar99@gmail.com")  # Where to receive messages

def send_email(contact_data: ContactMessage):
    """
    Send email using Gmail SMTP with App Password
    
    IMPORTANT: Use Gmail App Password, NOT your regular password
    How to generate:
    1. Go to Google Account Settings
    2. Security > 2-Step Verification (enable it)
    3. App Passwords > Generate new app password
    4. Copy the 16-character password
    5. Add to .env file as SMTP_PASSWORD
    """
    
    # Validate SMTP credentials
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured. Email will not be sent.")
        # Return success but log the issue - allows testing without email setup
        return {
            "status": "queued",
            "message": f"Message received from {contact_data.name}. Email notification pending configuration."
        }
    
    try:
        # Create email message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🌟 New Contact Message - Luxe Time"
        msg["From"] = SMTP_EMAIL
        msg["To"] = ADMIN_EMAIL
        msg["Reply-To"] = contact_data.email
        
        # Current timestamp
        timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        
        # HTML email body with luxury styling
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }}
                .email-container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                }}
                .header {{
                    background: linear-gradient(135deg, rgba(201, 160, 95, 0.9), rgba(201, 160, 95, 0.7));
                    padding: 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    color: #1a1a1a;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 30px;
                    color: #e0e0e0;
                }}
                .field {{
                    margin-bottom: 20px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.05);
                    border-left: 3px solid rgba(201, 160, 95, 0.8);
                    border-radius: 4px;
                }}
                .field-label {{
                    font-weight: 600;
                    color: rgba(201, 160, 95, 1);
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }}
                .field-value {{
                    color: #ffffff;
                    font-size: 16px;
                    line-height: 1.6;
                    word-wrap: break-word;
                }}
                .message-box {{
                    background: rgba(255, 255, 255, 0.08);
                    padding: 20px;
                    border-radius: 8px;
                    margin-top: 10px;
                    border: 1px solid rgba(201, 160, 95, 0.2);
                }}
                .footer {{
                    padding: 20px 30px;
                    text-align: center;
                    background: rgba(0, 0, 0, 0.3);
                    color: #888;
                    font-size: 12px;
                }}
                .timestamp {{
                    color: rgba(201, 160, 95, 0.8);
                    font-size: 13px;
                    margin-top: 15px;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>💎 New Contact Message</h1>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="field-label">Full Name</div>
                        <div class="field-value">{contact_data.name}</div>
                    </div>
                    
                    <div class="field">
                        <div class="field-label">Email Address</div>
                        <div class="field-value">
                            <a href="mailto:{contact_data.email}" style="color: rgba(201, 160, 95, 1); text-decoration: none;">
                                {contact_data.email}
                            </a>
                        </div>
                    </div>
                    
                    {f'''
                    <div class="field">
                        <div class="field-label">Phone Number</div>
                        <div class="field-value">{contact_data.phone}</div>
                    </div>
                    ''' if contact_data.phone else ''}
                    
                    <div class="field">
                        <div class="field-label">Message</div>
                        <div class="message-box">
                            <div class="field-value">{contact_data.message.replace(chr(10), '<br>')}</div>
                        </div>
                    </div>
                    
                    <div class="timestamp">
                        ⏰ Received: {timestamp}
                    </div>
                </div>
                <div class="footer">
                    Luxe Time - Virtual Watch Try-On Platform<br>
                    This is an automated message from your contact form.
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text fallback
        text_body = f"""
        NEW CONTACT MESSAGE - LUXE TIME
        ================================
        
        From: {contact_data.name}
        Email: {contact_data.email}
        Phone: {contact_data.phone or 'Not provided'}
        
        Message:
        {contact_data.message}
        
        ================================
        Received: {timestamp}
        """
        
        # Attach both versions
        part1 = MIMEText(text_body, "plain")
        part2 = MIMEText(html_body, "html")
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email via Gmail SMTP
        logger.info(f"Connecting to {SMTP_HOST}:{SMTP_PORT}")
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()  # Secure connection
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"✅ Email sent successfully to {ADMIN_EMAIL}")
        return True
        
    except smtplib.SMTPAuthenticationError:
        logger.error("❌ SMTP Authentication failed - check Gmail App Password")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email authentication failed. Please contact administrator."
        )
    except smtplib.SMTPException as e:
        logger.error(f"❌ SMTP Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email. Please try again later."
        )
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please contact administrator."
        )


@router.post("/contact", status_code=status.HTTP_200_OK)
async def submit_contact_form(contact_data: ContactMessage):
    """
    Handle contact form submission and send email
    
    Request body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",  // optional
        "message": "I'm interested in your watches..."
    }
    
    Returns:
    {
        "success": true,
        "message": "Thank you! We'll get back to you soon."
    }
    """
    
    logger.info(f"📧 New contact form submission from {contact_data.email}")
    
    # Send email (or queue if not configured)
    result = send_email(contact_data)
    
    # If email credentials not configured, return queued status
    if isinstance(result, dict) and result.get("status") == "queued":
        return {
            "success": True,
            "message": "Message received! Note: Email notifications are not configured yet."
        }
    
    return {
        "success": True,
        "message": "Thank you for contacting us! We'll get back to you within 24 hours."
    }
