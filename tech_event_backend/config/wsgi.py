"""
WSGI config for config project.
"""

import os
from django.core.wsgi import get_wsgi_application

# Set default settings to production for Railway
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')

application = get_wsgi_application()