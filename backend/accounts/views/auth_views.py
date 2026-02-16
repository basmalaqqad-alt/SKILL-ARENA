from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import AnonymousUser

from accounts.models import User  # نستخدم الموديل المخصص لنا


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required!'}, status=400)

        # محاولة التحقق من المستخدم مباشرة
        user = authenticate(request=request, username=username, password=password)
        
        if not user or user.is_anonymous:
            # إذا فشل authenticate، نحاول البحث عن المستخدم والتحقق من الباسورد يدوياً
            try:
                user_obj = User.objects.get(username=username)
                if user_obj.check_password(password):
                    user = user_obj
                else:
                    return Response({'error': 'Hero not found or wrong password!'}, status=400)
            except User.DoesNotExist:
                return Response({'error': 'Hero not found or wrong password!'}, status=400)

        if not user or not user.is_active:
            return Response({'error': 'Hero not found or wrong password!'}, status=400)

        token, created = Token.objects.get_or_create(user=user)

        # Daily Engagement: +10 XP مرة واحدة في اليوم
        try:
            user.give_daily_login_xp_if_needed(amount=10)
        except Exception:
            pass  # تجاهل الأخطاء في XP

        # التعديل الجوهري: إضافة حقل role لكي يفهمه React + XP الحالي
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email or '',
            'username': user.username,
            'role': user.role,  # هذا السطر هو مفتاح الدخول لصفحة المعلم
            'experience': user.experience or 0,
        })