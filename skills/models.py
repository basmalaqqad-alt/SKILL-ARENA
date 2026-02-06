from django.db import models
from django.contrib.auth.models import User # استدعاء جدول المستخدمين

class Skill(models.Model): # تأكدي إن الكلمة تبدأ بحرف S كبير
    name = models.CharField(max_length=100)
    description = models.TextField()
    level = models.CharField(max_length=50)

    def __str__(self):
        return self.name
    
class Skill(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills') # ربط المهارة بالمستخدم
    title = models.CharField(max_length=100)
    description = models.TextField()
    level = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.title} - {self.owner.username}"