from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
# لا تستخدمي User الافتراضي هنا

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response({'error': 'Hero not found or wrong password!'}, status=400)
            
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # التعديل الجوهري: إضافة حقل role لكي يفهمه React
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username,
            'role': user.role  # هذا السطر هو مفتاح الدخول لصفحة المعلم
        })