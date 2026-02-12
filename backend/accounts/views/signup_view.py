from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny]) # مسموح لكل الأبطال الجدد بالوصول
def signup_hero(request):
    # سحب البيانات من الطلب القادم من بسومة
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    # استلام الدور (tutor أو learner) لضمان التوجيه الصحيح
    role = request.data.get('role', 'learner') 
    
    # التأكد من اكتمال البيانات الأساسية
    if not username or not password:
        return Response({'error': 'Please provide all required fields!'}, status=status.HTTP_400_BAD_REQUEST)
        
    # منع تكرار أسماء الأبطال في الساحة
    if User.objects.filter(username=username).exists():
        return Response({'error': 'This hero name is already taken!'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # إنشاء المستخدم وتشفير كلمة المرور تلقائياً
        user = User.objects.create_user(username=username, email=email, password=password)
        # حفظ الدور داخل حقل بسيط في المستخدم لتذكّر الاختيار لاحقاً (خفيفة ومباشرة)
        user.first_name = role
        user.save()
        
        # توليد التوكن (المفتاح الذهبي) للدخول الفوري
        token, _ = Token.objects.get_or_create(user=user)
        
        # الرد الناجح الذي يوجه الواجهة للمسار الصحيح
        return Response({
            'token': token.key,
            'username': user.username,
            'role': role, # إرسال الدور لبسومة لتحديد الداشبورد
            'message': 'Welcome to SkillArena, Hero!'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # التعامل مع أي أخطاء غير متوقعة في السيرفر
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)