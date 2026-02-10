from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.serializers.auth_serializers import LoginSerializer
from rest_framework.authtoken.models import Token 

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"message": "يرجى إرسال بيانات الدخول عبر طلب POST"}, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "username": user.username,
                "message": "تم تسجيل الدخول بنجاح يا مروى!"
            }, status=status.HTTP_200_OK)
        
        # هاد السطر لازم يكون تحت الـ if تماماً (جوا الدالة)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)