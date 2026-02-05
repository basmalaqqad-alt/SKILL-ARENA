from django.db import models

class Skill(models.Model): # تأكدي إن الكلمة تبدأ بحرف S كبير
    name = models.CharField(max_length=100)
    description = models.TextField()
    level = models.CharField(max_length=50)

    def __str__(self):
        return self.name