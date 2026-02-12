import re
from rest_framework import serializers
# تأكدي أن هذا الاستيراد يشير إلى المودل المخصص في تطبيقك وليس الافتراضي
from accounts.models import User 

class RegisterSerializer(serializers.ModelSerializer):
    # إضافة الحقول الإضافية لتعمل مع نظام الأدوار في SkillArena
    role = serializers.CharField(write_only=True, required=True)
    certificate = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'certificate']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[a-z]", value) or not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain both letters and numbers.")
        return value

    def validate_certificate(self, value):
        if value:
            extension = value.name.split('.')[-1].lower()
            if extension not in ['pdf', 'doc', 'docx']:
                raise serializers.ValidationError("Only PDF or Word documents are allowed.")
        return value

    def create(self, validated_data):
        # 1. استخراج البيانات الإضافية قبل إنشاء المستخدم
        role = validated_data.get('role', 'learner')
        certificate = validated_data.get('certificate', None)

        # 2. إنشاء المستخدم وحفظ كلمة المرور مشفرة
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # 3. إسناد الدور والشهادة للمستخدم الجديد
        user.role = role
        if certificate:
            user.certificate = certificate
        
        user.save()
        return user