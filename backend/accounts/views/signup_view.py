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
        # 2. إنشاء المستخدم وتشفير الباسورد (بدون حفظ نهائي للآن)
        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=password
        )
        
        # 3. حفظ البيانات الإضافية التي أضفناها في الـ Models
        user.role = role
        if certificate:
            user.certificate = certificate # هنا يتم وضع الملف تلقائياً في مجلد media/certificates
        
        user.save() # حفظ نهائي لكل البيانات

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