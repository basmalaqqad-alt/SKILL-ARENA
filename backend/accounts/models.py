from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('tutor', 'Tutor'),
        ('learner', 'Learner'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='learner')
    certificate = models.FileField(upload_to='certificates/', null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    experience = models.PositiveIntegerField(default=0)  # XP فعلي للمستخدم

    @property
    def is_trusted_tutor(self):
        """معلم موثوق = عنده شهادة مرفوعة"""
        return self.role == 'tutor' and bool(self.certificate)

    def __str__(self):
        return self.username