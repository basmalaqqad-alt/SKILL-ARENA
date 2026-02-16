from django.contrib import admin
from .models import User, BankAccount


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'experience', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'email']


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['tutor', 'bank_name', 'account_number', 'account_holder_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['tutor__username', 'bank_name', 'account_number']
