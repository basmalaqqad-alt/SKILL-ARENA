from django.db import models
from django.contrib.auth.models import User

class Skill(models.Model):
    # استخدام related_name فريد لمنع التصادم
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tutor_skills_set')
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=50, default='Expert')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.tutor.username})"