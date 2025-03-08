# core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Custom exception handler for REST framework"""
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, there was an unhandled exception
    if response is None:
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        
        if isinstance(exc, Exception):
            # Return a generic error response for unhandled exceptions
            return Response(
                {"error": "An unexpected error occurred. Our team has been notified."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # Add more context to the response
    if response is not None:
        # Extract request details for logging
        request = context.get('request')
        view = context.get('view')
        view_name = view.__class__.__name__ if view else 'Unknown'
        
        # Log the exception with request details
        logger.error(
            f"API Error in {view_name}: {response.status_code} - {str(exc)} - "
            f"User: {request.user.id if request.user.is_authenticated else 'Anonymous'} -