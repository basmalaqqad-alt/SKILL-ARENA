# backend/accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from .models import User, BankAccount, VerificationRequest


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display  = ('username', 'email', 'role', 'experience', 'is_trusted_tutor', 'is_staff')
    list_filter   = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'email')
    fieldsets     = UserAdmin.fieldsets + (
        ('SkillArena', {'fields': ('role', 'certificate', 'avatar', 'experience', 'last_daily_xp')}),
    )


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display  = ('tutor', 'bank_name', 'account_number', 'iban')
    search_fields = ('tutor__username', 'bank_name')


# ── VerificationRequest ──────────────────────────────────────────

def approve_selected(modeladmin, request, queryset):
    """Admin action: approve selected requests."""
    for vr in queryset.filter(status='pending'):
        vr.status      = 'approved'
        vr.reviewed_at = timezone.now()
        vr.save()
        # Grant the verified badge
        tutor = vr.tutor
        tutor.certificate = vr.document
        tutor.save(update_fields=['certificate'])
approve_selected.short_description = '✅ Approve selected & grant Verified badge'


def reject_selected(modeladmin, request, queryset):
    """Admin action: reject selected requests."""
    queryset.filter(status='pending').update(
        status      = 'rejected',
        admin_note  = 'Rejected by admin.',
        reviewed_at = timezone.now(),
    )
reject_selected.short_description = '❌ Reject selected requests'


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display   = ('tutor', 'credential_type', 'institution', 'graduation_year', 'status', 'submitted_at', 'reviewed_at')
    list_filter    = ('status', 'credential_type')
    search_fields  = ('tutor__username', 'institution', 'field_of_study')
    readonly_fields = ('tutor', 'document', 'credential_type', 'institution',
                       'graduation_year', 'field_of_study', 'submitted_at')
    ordering       = ('-submitted_at',)
    actions        = [approve_selected, reject_selected]

    # Show document as a clickable link
    def document_link(self, obj):
        from django.utils.html import format_html
        if obj.document:
            return format_html('<a href="{}" target="_blank">📄 View Document</a>', obj.document.url)
        return '—'
    document_link.short_description = 'Document'

    # Override fieldsets to show document link
    fieldsets = (
        ('Tutor Info',   {'fields': ('tutor',)}),
        ('Credential',   {'fields': ('credential_type', 'institution', 'graduation_year', 'field_of_study', 'document')}),
        ('Review',       {'fields': ('status', 'admin_note', 'submitted_at', 'reviewed_at')}),
    )

    def save_model(self, request, obj, form, change):
        """When admin manually changes status to approved, grant the badge."""
        super().save_model(request, obj, form, change)
        if obj.status == 'approved':
            tutor = obj.tutor
            tutor.certificate = obj.document
            tutor.save(update_fields=['certificate'])
        elif obj.status == 'rejected':
            tutor = obj.tutor
            tutor.certificate = None
            tutor.save(update_fields=['certificate'])