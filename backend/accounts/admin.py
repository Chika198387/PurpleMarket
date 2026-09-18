from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Дополнительно', {'fields': ('phone', 'avatar')}),
    )
    list_display = ['id', 'username', 'email', 'phone', 'is_staff']


admin.site.register(User, UserAdmin)