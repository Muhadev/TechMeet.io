# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from .models import OrganizerRequest

@admin.register(OrganizerRequest)
class OrganizerRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization_name', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'organization_name']
    readonly_fields = ['created_at']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'status', 'created_at', 'updated_at')
        }),
        ('Organization Details', {
            'fields': ('organization_name', 'organization_description')
        }),
        ('Request Information', {
            'fields': ('reason_for_request', 'admin_notes')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # If the status is changed to APPROVED, update the user's role
        if 'status' in form.changed_data and obj.status == 'APPROVED':
            user = obj.user
            user.role = 'ORGANIZER'
            user.save()
        
        super().save_model(request, obj, form, change)

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_staff', 'auth_provider')
    list_filter = ('role', 'is_staff', 'is_active', 'auth_provider')
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Information', {'fields': ('profile_picture', 'role', 'auth_provider', 'auth_provider_id')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Profile Information', {'fields': ('email', 'profile_picture', 'role')}),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)

admin.site.register(User, CustomUserAdmin)