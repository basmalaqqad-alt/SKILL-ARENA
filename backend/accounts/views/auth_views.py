from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.serializers.auth_serializers import LoginSerializer
from rest_framework.authtoken.models import Token # استيراد المودل
class LoginView(APIView):
    # مسموح للكل يوصل لهاد الرابط عشان يسجل دخول
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # هاد السطر عشان ما يطلعلِك Error لما تفتحي الرابط بالمتصفح
        return Response({"message": "يرجى إرسال بيانات الدخول عبر طلب POST"}, status=status.HTTP_200_OK)

    def post(self, request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        # جلب أو إنشاء التوكن الخاص بالمستخدم
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key, # هاد الرقم اللي بسومة رح تخزنه عندها
            "username": user.username,
            "message": "تم تسجيل الدخول بنجاح"
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)