import re
from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    # Additional fields for SkillArena roles
    role = serializers.CharField(write_only=True)
    certificate = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'certificate']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_username(self, value):
        # Check if the username is already taken in the database
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        # Check if the email is already registered
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_password(self, value):
        # Ensure password is at least 8 characters and contains letters and numbers
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[a-z]", value) or not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain both letters and numbers.")
        return value

    def validate_certificate(self, value):
        # Restrict file uploads to PDF and Word documents only
        if value:
            extension = value.name.split('.')[-1].lower()
            if extension not in ['pdf', 'doc', 'docx']:
                raise serializers.ValidationError("Only PDF or Word documents are allowed.")
        return value

    def create(self, validated_data):
        # Create a new user with an encrypted password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user