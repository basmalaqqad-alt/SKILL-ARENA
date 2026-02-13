from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..serializers.profile_serializers import ProfileSerializer
from courses.models import CourseEnrollment


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    enrollments = CourseEnrollment.objects.filter(user=user).select_related('course')

    in_progress = []
    completed = []
    for e in enrollments:
        item = {'id': e.course.id, 'title': e.course.title, 'progress': e.progress}
        if e.completed:
            completed.append(item)
        else:
            in_progress.append(item)

    level = (user.experience // 100) + 1
    hero_data = {
        'username': user.username,
        'avatar_url': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
        'experience': user.experience,
        'stats': {
            'level': level,
            'experience': user.experience,
            'quests_completed': len(completed),
        },
        'badges': [],  # يمكن ربطه لاحقاً بجدول badges
        'in_progress_courses': in_progress,
        'completed_courses': completed,
        'is_trusted_tutor': getattr(user, 'is_trusted_tutor', False),
    }

    serializer = ProfileSerializer(hero_data)
    return Response(serializer.data)
