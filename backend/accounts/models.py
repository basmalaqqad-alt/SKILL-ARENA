from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = [
        ('tutor', 'Tutor'),
        ('learner', 'Learner'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='learner')
    certificate = models.FileField(upload_to='certificates/', null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    experience = models.PositiveIntegerField(default=0)  # XP الفعلي للمستخدم
    # آخر يوم أخذ فيه +10 XP للدخول اليومي
    last_daily_xp = models.DateField(null=True, blank=True)

    @property
    def is_trusted_tutor(self):
        """معلم موثوق = عنده شهادة مرفوعة"""
        return self.role == 'tutor' and bool(self.certificate)

    def add_xp(self, amount: int) -> None:
        """
        إضافة XP للمستخدم بشكل آمن وبسيط.
        لا نسمح بقيم سالبة هنا.
        """
        if not amount or amount <= 0:
            return
        # نستخدم القيمة الحالية ثم نحفظ
        self.experience = (self.experience or 0) + int(amount)
        self.save(update_fields=['experience'])

    def give_daily_login_xp_if_needed(self, amount: int = 10) -> bool:
        """
        يعطي المستخدم XP للدخول اليومي مرة واحدة في اليوم.
        يرجع True إذا تم إعطاء XP، False إذا كان أخذها اليوم مسبقاً.
        """
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
    """معلومات الحساب البنكي للإنستركتور"""
    tutor = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='bank_account',
        limit_choices_to={'role': 'tutor'}
    )
    bank_name = models.CharField(max_length=200, help_text='اسم البنك')
    account_number = models.CharField(max_length=50, help_text='رقم الحساب')
    account_holder_name = models.CharField(max_length=200, help_text='اسم صاحب الحساب')
    iban = models.CharField(max_length=34, blank=True, null=True, help_text='IBAN (اختياري)')
    swift_code = models.CharField(max_length=11, blank=True, null=True, help_text='SWIFT Code (اختياري)')
    branch_name = models.CharField(max_length=200, blank=True, null=True, help_text='اسم الفرع (اختياري)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Bank Account'
        verbose_name_plural = 'Bank Accounts'

    def __str__(self):
        return f"{self.tutor.username} - {self.bank_name}"