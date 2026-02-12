from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Skill
from .serializers import SkillSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_skills(request):
    if request.method == 'GET':
        skills = Skill.objects.filter(tutor=request.user)
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tutor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)