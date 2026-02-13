from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import HttpRequest
from accounts.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request: HttpRequest):
    """أعلى اليوزرز حسب الـ XP الفعلي"""
    users = User.objects.filter(is_active=True).order_by('-experience')[:50]
    request_obj = request
    data = []
    for rank, user in enumerate(users, start=1):
        avatar_url = None
        if user.avatar:
            avatar_url = request_obj.build_absolute_uri(user.avatar.url)
        color = '#FACA07' if rank == 1 else '#C0C0C0' if rank == 2 else '#CD7F32' if rank == 3 else None
        data.append({
            'id': user.id,
            'username': user.username,
            'xp': user.experience,
            'rank': rank,
            'color': color,
            'avatar_url': avatar_url,
        })
    return Response(data)
