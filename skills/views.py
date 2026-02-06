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