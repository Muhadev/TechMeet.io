# core/middleware.py
import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseTooManyRequests
import redis
from django.conf import settings

# Set up logger
logger = logging.getLogger(__name__)

class RequestLogMiddleware(MiddlewareMixin):
    """Middleware to log request timing and other metrics"""
    
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        # Skip if start_time wasn't set (e.g., for some middleware requests)
        if not hasattr(request, 'start_time'):
            return response
            
        # Calculate request duration
        duration = time.time() - request.start_time
        
        # Log request details
        logger.info(
            f"Request: {request.method} {request.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {duration:.2f}s - "
            f"User: {request.user.id if request.user.is_authenticated else 'Anonymous'}"
        )
        
        # Add timing header for API clients
        response['X-Request-Time'] = str(duration)
        
        return response

class RateLimitMiddleware(MiddlewareMixin):
    """Middleware to implement rate limiting"""
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        # Connect to Redis
        self.redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        
        # Rate limit settings
        self.rate_limit = 60  # requests per minute
        self.rate_limit_window = 60  # seconds
        
        # Higher limit for specific endpoints
        self.high_limit_paths = ['/api/events/', '/api/tickets/']
        self.high_rate_limit = 200  # requests per minute
    
    def process_request(self, request):
        # Skip rate limiting for certain conditions
        if settings.DEBUG and not settings.RATE_LIMIT_IN_DEBUG:
            return None
            
        # Get client identifier (IP or user ID if authenticated)
        client_id = request.user.id if request.user.is_authenticated else request.META.get('REMOTE_ADDR')
        
        # Determine which rate limit to use based on path
        path = request.path
        rate_limit = self.high_rate_limit if any(path.startswith(p) for p in self.high_limit_paths) else self.rate_limit
        
        # Create a Redis key specific to this client
        redis_key = f"rate_limit:{client_id}:{path.split('/')[1]}"
        
        # Get current count from Redis
        count = self.redis.incr(redis_key)
        
        # Set expiry on first request
        if count == 1:
            self.redis.expire(redis_key, self.rate_limit_window)
        
        # If rate limit exceeded, return 429 Too Many Requests
        if count > rate_limit:
            logger.warning(f"Rate limit exceeded for {client_id} on {path}")
            return HttpResponseTooManyRequests("Rate limit exceeded. Please try again later.")
        
        # Add rate limit headers to response
        request.rate_limit = rate_limit
        request.rate_limit_remaining = max(0, rate_limit - count)
        
        return None
    
    def process_response(self, request, response):
        # Add rate limit headers if available
        if hasattr(request, 'rate_limit'):
            response['X-RateLimit-Limit'] = str(request.rate_limit)
            response['X-RateLimit-Remaining'] = str(request.rate_limit_remaining)
            
        return response

# Add to settings.py
"""
MIDDLEWARE = [
    ...
    'core.middleware.RequestLogMiddleware',
    'core.middleware.RateLimitMiddleware',
    ...
]
"""