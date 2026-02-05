from rest_framework import serializers
from .models import Skill # استدعاء الموديل اللي برمجتيه سوا

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__' # هاد السطر بيحكي للدجانغو: "حول كل أعمدة الجدول لنصوص