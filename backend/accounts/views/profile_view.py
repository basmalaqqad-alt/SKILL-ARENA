from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..serializers.profile_serializers import ProfileSerializer
from courses.models import CourseEnrollment


def _get_rank_name(xp: int) -> str:
    """
    تحديد الرتبة حسب الـ XP:
    - Novice  : 0   –  999
    - Warrior : 1,000 – 4,999
    - Knight  : 5,000 – 14,999
    - Master  : 15,000 – 49,999
    - Legend  : 50,000+
    """
    if xp >= 50000:
        return "Legend"
    if xp >= 15000:
        return "Master"
    if xp >= 5000:
        return "Knight"
    if xp >= 1000:
        return "Warrior"
    return "Novice"


def _get_level_and_progress(xp: int) -> tuple[int, int]:
    """
    تقسيم بسيط للمستويات على أساس XP (1–50) + نسبة التقدم للـ UI.
    """
    # كل 200 XP = مستوى واحد تقريباً، مع سقف 50
    level = min(50, (xp // 200) + 1)
    # تقدّم داخل المستوى الحالي (0–100%)
    current_level_min_xp = max(0, (level - 1) * 200)
    next_level_min_xp = level * 200
    span = max(1, next_level_min_xp - current_level_min_xp)
    progress = int(((xp - current_level_min_xp) / span) * 100) if xp >= current_level_min_xp else 0
    progress = max(0, min(100, progress))
    return level, progress


def _build_badges(user, completed_count: int) -> list[str]:
    """
    Badges بسيطة حسب المستند:
    - Milestone Badges بعدد الكورسات المكتملة
    - Trusted Tutor badge للمعلمين الموثوقين
    """
    badges: list[str] = []

    # Milestone badges على أساس عدد الكورسات المكتملة
    if completed_count >= 5:
        badges.append("The Starter")          # 5+ courses
    if completed_count >= 10:
        badges.append("The Explorer")         # 10+ courses
    if completed_count >= 25:
        badges.append("The Scholar")          # 25+ courses
    if completed_count >= 50:
        badges.append("The Mentor")           # 50+ courses
    if completed_count >= 100:
        badges.append("The Professor")        # 100+ courses

    # Trust badge
    if getattr(user, "is_trusted_tutor", False):
        badges.append("Trusted Tutor")

    return badges


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

    xp = user.experience or 0
    level, progress_percentage = _get_level_and_progress(xp)
    rank_name = _get_rank_name(xp)
    badges = _build_badges(user, completed_count=len(completed))
    arena_coins = xp // 1000  # 1,000 XP = 1 Arena Coin (بسيطة حالياً بدون خصم عند الصرف)

    hero_data = {
        'username': user.username,
        'avatar_url': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
        'experience': xp,
        'arena_coins': arena_coins,
        'rank_name': rank_name,
        'progress_percentage': progress_percentage,
        'stats': {
            'level': level,
            'experience': xp,
            'quests_completed': len(completed),
        },
        'badges': badges,
        'in_progress_courses': in_progress,
        'completed_courses': completed,
        'is_trusted_tutor': getattr(user, 'is_trusted_tutor', False),
    }

    serializer = ProfileSerializer(hero_data)
    return Response(serializer.data)
