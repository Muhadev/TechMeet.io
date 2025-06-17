# events/admin.py (updated for better draft management)
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'organizer', 'status', 'category', 'start_date', 
        'ticket_price', 'max_attendees', 'created_at', 'is_complete'
    ]
    list_filter = ['status', 'category', 'created_at', 'start_date']
    search_fields = ['title', 'description', 'location', 'organizer__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'organizer', 'category', 'status')
        }),
        ('Event Details', {
            'fields': ('location', 'start_date', 'end_date', 'max_attendees', 'ticket_price')
        }),
        ('Media', {
            'fields': ('banner_image',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def is_complete(self, obj):
        """Show if event has all required fields"""
        if obj.status == 'DRAFT':
            missing = obj.get_missing_fields_for_publishing()
            if missing:
                return format_html(
                    '<span style="color: orange;">Missing: {}</span>',
                    ', '.join(missing)
                )
            else:
                return format_html('<span style="color: green;">Ready to publish</span>')
        return format_html('<span style="color: blue;">{}</span>', obj.get_status_display())
    
    is_complete.short_description = 'Completion Status'
    
    actions = ['mark_as_published', 'mark_as_draft']
    
    def mark_as_published(self, request, queryset):
        """Bulk action to publish events"""
        updated = 0
        errors = []
        
        for event in queryset:
            if event.status == 'DRAFT' and event.can_be_published():
                event.status = 'PUBLISHED'
                try:
                    event.save()
                    updated += 1
                except Exception as e:
                    errors.append(f"{event.title}: {str(e)}")
        
        if updated:
            self.message_user(request, f"{updated} events published successfully.")
        if errors:
            self.message_user(request, f"Errors: {'; '.join(errors)}", level='ERROR')
    
    mark_as_published.short_description = "Publish selected draft events"
    
    def mark_as_draft(self, request, queryset):
        """Bulk action to convert to draft (limited cases)"""
        updated = 0
        errors = []
        
        for event in queryset.filter(status='PUBLISHED'):
            # Only allow if event hasn't started yet
            if event.start_date > timezone.now():
                event.status = 'DRAFT'
                try:
                    event.save()
                    updated += 1
                except Exception as e:
                    errors.append(f"{event.title}: {str(e)}")
            else:
                errors.append(f"{event.title}: Cannot draft past/current events")
        
        if updated:
            self.message_user(request, f"{updated} events converted to draft.")
        if errors:
            self.message_user(request, f"Errors: {'; '.join(errors)}", level='ERROR')