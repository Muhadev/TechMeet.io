# events/models.py (updated with additional methods)
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

class Event(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='organized_events'
    )
    location = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    category = models.CharField(max_length=100)
    banner_image = models.ImageField(upload_to='events/banners/', null=True, blank=True)
    max_attendees = models.PositiveIntegerField(default=100)
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'start_date']),
            models.Index(fields=['organizer', 'status']),
            models.Index(fields=['category', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
    
    def clean(self):
        """Model-level validation"""
        if self.status == 'PUBLISHED':
            if not all([self.title, self.description, self.location, self.start_date, self.end_date, self.category]):
                raise ValidationError('All fields are required for published events.')
            
            if self.start_date and self.end_date and self.end_date <= self.start_date:
                raise ValidationError('End date must be after start date.')
            
            if self.start_date and self.start_date <= timezone.now():
                raise ValidationError('Start date must be in the future.')
    
    def is_draft(self):
        """Check if event is in draft status"""
        return self.status == 'DRAFT'
    
    def is_published(self):
        """Check if event is published"""
        return self.status == 'PUBLISHED'
    
    def can_be_published(self):
        """Check if draft event has all required fields for publishing"""
        required_fields = [
            self.title, self.description, self.location, 
            self.start_date, self.end_date, self.category
        ]
        return all(field for field in required_fields)
    
    def get_missing_fields_for_publishing(self):
        """Get list of fields missing for publishing"""
        field_map = {
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'category': self.category,
        }
        
        missing = []
        for field_name, field_value in field_map.items():
            if not field_value:
                missing.append(field_name)
        
        # Check date logic
        if self.start_date and self.end_date:
            if self.end_date <= self.start_date:
                missing.append('end_date (must be after start date)')
            if self.start_date <= timezone.now():
                missing.append('start_date (must be in future)')
        
        return missing
    
    def save(self, *args, **kwargs):
        """Override save to handle status transitions"""
        if self.pk:  # Existing event
            old_instance = Event.objects.get(pk=self.pk)
            
            # Prevent certain status changes
            if old_instance.status == 'PUBLISHED' and self.status == 'DRAFT':
                raise ValidationError('Cannot change published event back to draft')
            
            if old_instance.status in ['COMPLETED', 'CANCELLED'] and self.status != old_instance.status:
                raise ValidationError(f'Cannot change status from {old_instance.status}')
        
        self.full_clean()
        super().save(*args, **kwargs)