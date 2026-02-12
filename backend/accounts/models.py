from django.db import models
from django.contrib.auth.models import User

class Skill(models.Model):
    # غيري related_name إلى accounts_skills عشان ما يتصادم مع أي تطبيق ثاني
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts_skills')
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=50, default='Beginner')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.tutor.username}"
# Create your models here.
