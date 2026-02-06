from rest_framework import viewsets
from .models import Skill
from .serializers import SkillSerializer

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all() # هاد السطر بيسحب كل المهارات اللي أضفتيها
    serializer_class = SkillSerializer # هاد السطر بيحدد المترجم اللي عملناه
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
class CustomLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username,
            'user_id': user.pk
        })