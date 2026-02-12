from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth.models import User

# الكلاس المسؤول عن تسجيل دخول الأبطال وتوليد التوكن
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        # التحقق من صحة اسم المستخدم وكلمة المرور
        serializer = self.serializer_class(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response({'error': 'Hero not found or wrong password!'}, status=400)
            
        user = serializer.validated_data['user']
        
        # جلب التوكن الحالي أو إنشاء واحد جديد إذا لم يوجد
        token, created = Token.objects.get_or_create(user=user)
        
        # تحديد الدور إذا تم حفظه عند التسجيل (نستخدم first_name كخيار سريع وخفيف)
        role = getattr(user, 'first_name', '') or 'learner'

        # إرسال البيانات للواجهة (React) ليظهر اسمك في البروفايل ويعرف الواجهة المناسبة
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username,
            'role': role
        })