from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny]) # ضروري عشان أي بطل جديد يقدر يسجل
def signup_hero(request): # تأكدي أن الاسم هنا signup_hero بالظبط
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # التحقق من وجود البيانات
    if not username or not password:
        return Response({'error': 'Please provide all required fields!'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username=username).exists():
        return Response({'error': 'This hero name is already taken!'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # إنشاء المستخدم وتشفير الباسورد
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # إنشاء توكن فوراً عشان يدخل للداشبورد مباشرة
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'username': user.username,
            'message': 'Welcome to SkillArena, Hero!'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)