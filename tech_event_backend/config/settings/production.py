# config/settings/production.py
"""
Production settings for config project.
"""

from .base import *
import dj_database_url
import pymysql
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()


# Install PyMySQL as MySQLclient for Django
pymysql.install_as_MySQLdb()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required for production")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Allowed hosts configuration
ALLOWED_HOSTS = []
if os.environ.get('ALLOWED_HOSTS'):
    ALLOWED_HOSTS = [host.strip() for host in os.environ.get('ALLOWED_HOSTS').split(',') if host.strip()]

# Add Railway.app domain by default
railway_domain = os.environ.get('RAILWAY_PUBLIC_DOMAIN')
if railway_domain:
    ALLOWED_HOSTS.append(railway_domain)

# Fallback allowed hosts
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = [
        'techmeetio.up.railway.app',
        '.railway.app',
        'localhost',
        '127.0.0.1',
    ]

# Database configuration - Railway provides DATABASE_URL
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Email backend configuration
EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
if not SENDGRID_API_KEY:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@techmeetio.com')

# Social account providers configuration
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'github': {
        'APP': {
            'client_id': os.environ.get('GITHUB_CLIENT_ID'),
            'secret': os.environ.get('GITHUB_CLIENT_SECRET'),
        },
        'SCOPE': [
            'user',
            'user:email',
        ],
    }
}

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')

# Add validation warnings
if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET]):
    print("WARNING: Google OAuth credentials not configured")
    
if not all([GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET]):
    print("WARNING: GitHub OAuth credentials not configured")

# URL configuration
BACKEND_URL = os.environ.get('BACKEND_URL', 'https://techmeetio.up.railway.app/api')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://tech-meet-io.vercel.app')

# Social auth callback URLs
GOOGLE_CALLBACK_URL = f"{os.environ.get('API_BASE_URL', 'https://techmeetio.up.railway.app/api')}/auth/google/callback/"
GITHUB_CALLBACK_URL = f"{os.environ.get('API_BASE_URL', 'https://techmeetio.up.railway.app/api')}/auth/github/callback/"

# Paystack settings
PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY', '')
PAYSTACK_PUBLIC_KEY = os.environ.get('PAYSTACK_PUBLIC_KEY', '')
PAYSTACK_CALLBACK_URL = os.environ.get('PAYSTACK_CALLBACK_URL', f'{FRONTEND_URL}/payment/verify')

# CORS settings for production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://tech-meet-io.vercel.app",
]

# Add any additional frontend domains from environment
if os.environ.get('CORS_ALLOWED_ORIGINS'):
    additional_origins = [url.strip() for url in os.environ.get('CORS_ALLOWED_ORIGINS').split(',') if url.strip()]
    CORS_ALLOWED_ORIGINS.extend(additional_origins)

# CSRF Settings
CSRF_TRUSTED_ORIGINS = [
    'https://tech-meet-io.vercel.app',
    'https://techmeetio.up.railway.app',
]

# Add Railway domain if available
if railway_domain:
    CSRF_TRUSTED_ORIGINS.append(f'https://{railway_domain}')

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Allow these headers to be used
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-forwarded-for',
    'x-forwarded-proto',
    'cache-control',
    'pragma',
]

# Allow these HTTP methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Add preflight max age
CORS_PREFLIGHT_MAX_AGE = 86400

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Railway handles SSL termination
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Railway proxy configuration
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Production logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Session configuration
SESSION_COOKIE_AGE = 86400
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'

# CSRF configuration
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_USE_SESSIONS = False