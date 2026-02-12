from django.db import models
from django.conf import settings # استدعاء الإعدادات لاستخدام الموديل الجديد

class Skill(models.Model): 
    # التعديل الأهم: ربط المهارة بالمستخدم المخصص عبر settings
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='skills'
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    level = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.title} - {self.owner.username}"