from rest_framework import serializers
from .models import Skill # استدعاء الموديل اللي برمجتيه سةا ص

class SkillSerializer(serializers.ModelSerializer):
     owner = serializers.ReadOnlyField(source='owner.username') # يقرأ اسم المستخدم فقط

     class Meta:
        model = Skill
        fields = ['id', 'title', 'description', 'level', 'owner']