# backend/accounts/models.py
# أضيفت VerificationRequest في الأسفل — باقي الكود نفسه

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = [
        ('tutor',   'Tutor'),
        ('learner', 'Learner'),
    ]

    role        = models.CharField(max_length=10, choices=ROLE_CHOICES, default='learner')
    certificate = models.FileField(upload_to='certificates/', null=True, blank=True)
    avatar      = models.ImageField(upload_to='avatars/',     null=True, blank=True)
    experience  = models.PositiveIntegerField(default=0)
    last_daily_xp = models.DateField(null=True, blank=True)

    @property
    def is_trusted_tutor(self):
        """معلم موثوق = عنده شهادة مرفوعة (يُعيَّن بواسطة الأدمن فقط)"""
        return self.role == 'tutor' and bool(self.certificate)

    def add_xp(self, amount: int) -> None:
        if not amount or amount <= 0:
            return
        self.experience = (self.experience or 0) + int(amount)
        self.save(update_fields=['experience'])

    def give_daily_login_xp_if_needed(self, amount: int = 10) -> bool:
        today = timezone.now().date()
        if self.last_daily_xp == today:
            return False
        self.last_daily_xp = today
        self.experience = (self.experience or 0) + int(amount)
        self.save(update_fields=['experience', 'last_daily_xp'])
        return True

    def __str__(self):
        return self.username


class BankAccount(models.Model):
    tutor               = models.OneToOneField(User, on_delete=models.CASCADE, related_name='bank_account', limit_choices_to={'role': 'tutor'})
    bank_name           = models.CharField(max_length=200)
    account_number      = models.CharField(max_length=50)
    account_holder_name = models.CharField(max_length=200)
    iban                = models.CharField(max_length=34,  blank=True, null=True)
    swift_code          = models.CharField(max_length=11,  blank=True, null=True)
    branch_name         = models.CharField(max_length=200, blank=True, null=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tutor.username} - {self.bank_name}"


# ── NEW ──────────────────────────────────────────────────────────────
class VerificationRequest(models.Model):
    """
    طلب توثيق المعلم — يقدّمه التيوتر، يراجعه الأدمن.
    بعد الموافقة يُعيَّن tutor.certificate ويصير is_trusted_tutor = True.
    """

    CREDENTIAL_CHOICES = [
        ('bachelor',     "Bachelor's Degree"),
        ('master',       "Master's Degree"),
        ('phd',          'PhD / Doctorate'),
        ('professional', 'Professional Certificate'),
        ('other',        'Other'),
    ]

    STATUS_CHOICES = [
        ('pending',  'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    tutor           = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification_request', limit_choices_to={'role': 'tutor'})
    document        = models.FileField(upload_to='verifications/')
    credential_type = models.CharField(max_length=50, choices=CREDENTIAL_CHOICES)
    institution     = models.CharField(max_length=300)
    graduation_year = models.PositiveSmallIntegerField()
    field_of_study  = models.CharField(max_length=300)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note      = models.TextField(blank=True)
    submitted_at    = models.DateTimeField(auto_now_add=True)
    reviewed_at     = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.tutor.username} — {self.get_credential_type_display()} [{self.status}]"