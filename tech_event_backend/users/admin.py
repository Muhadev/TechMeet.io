# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

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