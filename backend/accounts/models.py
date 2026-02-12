from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # الأدوار المتاحة (يجب أن تطابق الكلمات في React)
    ROLE_CHOICES = [
        ('tutor', 'Tutor'),
        ('learner', 'Learner'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='learner')
    # هذا الحقل هو الذي سيقوم بتعبئة مجلد الميديا
    certificate = models.FileField(upload_to='certificates/', null=True, blank=True)

    def __str__(self):
        return self.username