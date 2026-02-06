from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Skill # استدعاء الموديل اللي برمجتيه سوا

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__' # هاد السطر بيحكي للدجانغو: "حول كل أعمدة الجدول لنصوص
        

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}} # عشان الباسورد ما يرجع يظهر في الـ API للأمان

    def create(self, validated_data):
        # تشفير كلمة المرور قبل الحفظ في قاعدة البيانات
        user = User.objects.create_user(**validated_data)
        return user
    class SkillSerializer(serializers.ModelSerializer):
     owner = serializers.ReadOnlyField(source='owner.username') # يقرأ اسم المستخدم فقط

     class Meta:
        model = Skill
        fields = ['id', 'title', 'description', 'level', 'owner']