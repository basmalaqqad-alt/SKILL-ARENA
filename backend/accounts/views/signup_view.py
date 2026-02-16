from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser # أضفنا هذا لاستقبال الملفات
from accounts.models import User # تأكدي أن الاستيراد من الموديل الخاص بكِ
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser]) # ضروري جداً عشان الباك إند "يشوف" الشهادة المرفوعة
def signup_hero(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    role = request.data.get('role', 'learner') # استلام الدور، لو ما وصل يعتبره learner
    certificate = request.FILES.get('certificate') # استلام ملف الشهادة من الطلب

    # 1. التحقق من وجود البيانات الأساسية
    if not username or not password:
        return Response({'error': 'Please provide all required fields!'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username=username).exists():
        return Response({'error': 'This hero name is already taken!'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 2. إنشاء المستخدم وتشفير الباسورد
        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=password  # create_user يقوم بتشفير الباسورد تلقائياً
        )
        
        # 3. تحديث البيانات الإضافية (role, certificate, XP)
        user.role = role
        if certificate:
            user.certificate = certificate
        user.experience = 100  # Welcome Bonus
        
        # حفظ الحقول المحددة فقط (لضمان عدم إعادة حفظ password hash)
        update_fields = ['role', 'experience']
        if certificate:
            update_fields.append('certificate')
        user.save(update_fields=update_fields)

        # 4. إنشاء توكن فوراً لضمان الدخول التلقائي
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'username': user.username,
            'role': user.role,
            'message': 'Welcome to SkillArena, Hero!'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)