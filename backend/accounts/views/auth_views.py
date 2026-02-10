from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.serializers.auth_serializers import LoginSerializer

class LoginView(APIView):
    # مسموح للكل يوصل لهاد الرابط عشان يسجل دخول
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # هاد السطر عشان ما يطلعلِك Error لما تفتحي الرابط بالمتصفح
        return Response({"message": "يرجى إرسال بيانات الدخول عبر طلب POST"}, status=status.HTTP_200_OK)

    def post(self, request):
        # هون الكود الفعلي اللي بيتحقق من البيانات
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            return Response({
                "message": "تم تسجيل الدخول بنجاح يا مروى!",
                "username": user.username
            }, status=status.HTTP_200_OK)
        
        # إذا البيانات غلط، بيرجع رسالة الخطأ اللي شفناها بالصورة الأولى
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)