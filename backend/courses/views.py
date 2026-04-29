# backend/courses/views.py
# ── All original endpoints kept unchanged + new section/video endpoints ──

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from .models import (
    Course, CourseSection, CourseVideo, CourseEnrollment,
    CourseComment, CourseRating, CoursePayment, CourseMaterial,
    Quiz, Question,
)
from .serializers import (
    CourseSerializer, CourseCreateSerializer, CourseDetailSerializer,
    CourseCommentSerializer, CourseRatingSerializer,
    QuizSerializer, QuizCreateSerializer, CourseMaterialSerializer,
    CourseSectionSerializer, CourseVideoSerializer,
)


def _tutor(user):
    return user.role == 'tutor'


# ════════════════════════════════════════════════════════════════════
#  COURSE CRUD (original — unchanged)
# ════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_course(request):
    if not _tutor(request.user):
        return Response({'error': 'Only tutors can create courses'}, status=403)
    serializer = CourseCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        course = serializer.save()
        try: request.user.add_xp(500)
        except AttributeError: pass
        return Response(CourseSerializer(course, context={'request': request}).data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tutor_courses(request):
    if not _tutor(request.user):
        return Response({'error': 'Only tutors can access this endpoint'}, status=403)
    courses = Course.objects.filter(tutor=request.user).prefetch_related(
        'extra_videos', 'materials', 'sections__videos', 'sections__materials'
    )
    return Response(CourseSerializer(courses, many=True, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    if not _tutor(request.user):
        return Response({'error': 'Only tutors can delete courses'}, status=403)
    try:
        Course.objects.get(id=course_id, tutor=request.user).delete()
        return Response({'message': 'Course deleted'})
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_learner_courses(request):
    courses = Course.objects.all().prefetch_related('extra_videos', 'materials', 'ratings')
    return Response(CourseSerializer(courses, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_learner_enrolled_courses(request):
    if request.user.role != 'learner':
        return Response({'error': 'Only learners'}, status=403)
    enrollments = CourseEnrollment.objects.filter(user=request.user).select_related('course', 'course__tutor')
    data = []
    for e in enrollments:
        d = CourseDetailSerializer(e.course, context={'request': request}).data
        d['enrollment'] = {'progress': e.progress, 'completed': e.completed, 'enrolled_at': e.enrolled_at}
        data.append(d)
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_detail(request, course_id):
    try:
        course = Course.objects.prefetch_related(
            'comments', 'ratings', 'quizzes__questions',
            'materials', 'extra_videos',
            'sections__videos__quizzes', 'sections__materials',
        ).get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    data = CourseDetailSerializer(course, context={'request': request}).data

    if course.is_paid and course.price:
        try:
            from accounts.models import BankAccount
            ba = BankAccount.objects.get(tutor=course.tutor)
            acct = ba.account_number
            data['tutor_bank_account'] = {
                'bank_name':           ba.bank_name,
                'account_holder_name': ba.account_holder_name,
                'account_number':      '*' * (len(acct) - 4) + acct[-4:] if len(acct) > 4 else acct,
                'iban':       ba.iban,
                'swift_code': ba.swift_code,
                'branch_name': ba.branch_name,
            }
        except Exception:
            data['tutor_bank_account'] = None

    return Response(data)


# ════════════════════════════════════════════════════════════════════
#  ENROLL (original — unchanged)
# ════════════════════════════════════════════════════════════════════

def _validate_card(card_number, expiry_month, expiry_year, cvv):
    import re
    if not card_number or len(re.sub(r'\s', '', str(card_number))) < 13:
        return False, 'Invalid card number'
    try:
        m, y = int(expiry_month), int(expiry_year)
        if not (1 <= m <= 12): return False, 'Invalid expiry month'
        if y < 100: y += 2000
        if y < 2020 or y > 2050: return False, 'Invalid expiry year'
    except (TypeError, ValueError):
        return False, 'Invalid expiry date'
    if not cvv or len(str(cvv).strip()) < 3:
        return False, 'CVV required'
    return True, None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, course_id):
    if request.user.role != 'learner':
        return Response({'error': 'Only learners can enroll'}, status=403)
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    is_paid = course.is_paid and (course.price or 0) > 0
    payment = None

    if is_paid:
        method = (request.data.get('payment_method') or '').strip().lower()
        if method not in ('apple_pay', 'card', 'bank_transfer'):
            return Response({'error': 'payment_required', 'message': 'Course is paid.'}, status=400)
        card_last4 = ''
        if method == 'card':
            ok, err = _validate_card(
                request.data.get('card_number'), request.data.get('expiry_month'),
                request.data.get('expiry_year'), request.data.get('cvv'),
            )
            if not ok: return Response({'error': err}, status=400)
            digits = ''.join(c for c in str(request.data.get('card_number', '')) if c.isdigit())
            card_last4 = digits[-4:] if len(digits) >= 4 else digits
        payment, _ = CoursePayment.objects.update_or_create(
            user=request.user, course=course,
            defaults={
                'tutor': course.tutor, 'method': method,
                'amount': course.price, 'card_last4': card_last4,
                'transaction_reference': request.data.get('transaction_reference', ''),
                'status': 'completed' if method in ('apple_pay', 'card') else 'pending',
                'completed_at': timezone.now() if method in ('apple_pay', 'card') else None,
            }
        )

    enrollment, created = CourseEnrollment.objects.get_or_create(
        user=request.user, course=course, defaults={'progress': 0, 'completed': False}
    )
    return Response({
        'message': 'Enrolled successfully' if created else 'Already enrolled',
        'enrollment': {'course_id': course.id, 'progress': enrollment.progress},
        'payment': {'method': payment.method, 'amount': float(payment.amount), 'status': payment.status} if payment else None,
    }, status=201 if created else 200)


# ════════════════════════════════════════════════════════════════════
#  COMMENTS & RATINGS (original — unchanged)
# ════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course_comment(request, course_id):
    try: course = Course.objects.get(id=course_id)
    except Course.DoesNotExist: return Response({'error': 'Not found'}, status=404)
    text = request.data.get('text', '').strip()
    if not text: return Response({'error': 'Text required'}, status=400)
    comment = CourseComment.objects.create(course=course, user=request.user, text=text)
    try: request.user.add_xp(50)
    except AttributeError: pass
    return Response(CourseCommentSerializer(comment).data, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course_rating(request, course_id):
    try: course = Course.objects.get(id=course_id)
    except Course.DoesNotExist: return Response({'error': 'Not found'}, status=404)
    stars = request.data.get('stars')
    if stars is None: return Response({'error': 'stars required'}, status=400)
    try:
        stars = int(stars)
        if not 1 <= stars <= 5: raise ValueError
    except (TypeError, ValueError):
        return Response({'error': 'stars must be 1–5'}, status=400)
    rating, _ = CourseRating.objects.update_or_create(course=course, user=request.user, defaults={'stars': stars})
    return Response({'message': 'Rating saved', 'stars': rating.stars})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_course(request, course_id):
    if request.user.role != 'learner': return Response({'error': 'Only learners'}, status=403)
    try: course = Course.objects.get(id=course_id)
    except Course.DoesNotExist: return Response({'error': 'Not found'}, status=404)
    try: enrollment = CourseEnrollment.objects.get(user=request.user, course=course)
    except CourseEnrollment.DoesNotExist: return Response({'error': 'Must enroll first'}, status=400)
    was = enrollment.completed
    enrollment.completed = True; enrollment.progress = 100; enrollment.save()
    xp = 0
    if not was:
        try: request.user.add_xp(50); xp = 50
        except AttributeError: pass
    return Response({'message': 'Completed', 'xp_awarded': xp, 'total_xp': getattr(request.user, 'experience', 0)})


# ════════════════════════════════════════════════════════════════════
#  SECTION endpoints (NEW)
# ════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_section(request, course_id):
    """Tutor creates a section (chapter) inside a course."""
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try: course = Course.objects.get(id=course_id, tutor=request.user)
    except Course.DoesNotExist: return Response({'error': 'Course not found'}, status=404)

    title = request.data.get('title', '').strip()
    if not title: return Response({'error': 'title required'}, status=400)
    order = request.data.get('order', course.sections.count() + 1)
    section = CourseSection.objects.create(course=course, title=title, order=order)
    return Response(CourseSectionSerializer(section, context={'request': request}).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_section(request, course_id, section_id):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try:
        section = CourseSection.objects.get(id=section_id, course__id=course_id, course__tutor=request.user)
        section.delete()
        return Response({'message': 'Section deleted'})
    except CourseSection.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


# ════════════════════════════════════════════════════════════════════
#  VIDEO endpoints (existing + section-aware NEW)
# ════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def add_course_video(request, course_id):
    """Add video to a course — optionally inside a section."""
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try: course = Course.objects.get(id=course_id, tutor=request.user)
    except Course.DoesNotExist: return Response({'error': 'Course not found'}, status=404)

    video_file = request.FILES.get('video_file')
    if not video_file: return Response({'error': 'video_file required'}, status=400)

    section_id = request.data.get('section_id')
    section    = None
    if section_id:
        try: section = CourseSection.objects.get(id=section_id, course=course)
        except CourseSection.DoesNotExist: pass

    video = CourseVideo.objects.create(
        course     = course,
        section    = section,
        title      = request.data.get('title', video_file.name),
        video_file = video_file,
        order      = int(request.data.get('order', course.extra_videos.count() + 1)),
    )
    return Response(CourseVideoSerializer(video, context={'request': request}).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course_video(request, course_id, video_id):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try:
        vid = CourseVideo.objects.get(id=video_id, course__id=course_id, course__tutor=request.user)
        vid.delete()
        return Response({'message': 'Video deleted'})
    except CourseVideo.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


# ════════════════════════════════════════════════════════════════════
#  MATERIAL endpoints (original unchanged)
# ════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def add_course_material(request, course_id):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try: course = Course.objects.get(id=course_id, tutor=request.user)
    except Course.DoesNotExist: return Response({'error': 'Not found'}, status=404)

    file_obj = request.FILES.get('file')
    if not file_obj: return Response({'error': 'file required'}, status=400)

    name = file_obj.name.lower()
    mat_type = 'pdf' if name.endswith('.pdf') else 'doc' if name.endswith(('.doc', '.docx')) else 'other'

    section_id = request.data.get('section_id')
    section    = None
    if section_id:
        try: section = CourseSection.objects.get(id=section_id, course=course)
        except CourseSection.DoesNotExist: pass

    mat = CourseMaterial.objects.create(
        course        = course,
        section       = section,
        file          = file_obj,
        title         = request.data.get('title', file_obj.name),
        material_type = mat_type,
        order         = int(request.data.get('order', course.materials.count() + 1)),
    )
    return Response(CourseMaterialSerializer(mat, context={'request': request}).data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course_material(request, course_id, material_id):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try:
        CourseMaterial.objects.get(id=material_id, course__id=course_id, course__tutor=request.user).delete()
        return Response({'message': 'Deleted'})
    except CourseMaterial.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


# ════════════════════════════════════════════════════════════════════
#  QUIZ endpoints (original unchanged)
# ════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    s = QuizCreateSerializer(data=request.data, context={'request': request})
    if s.is_valid():
        quiz = s.save()
        return Response(QuizSerializer(quiz).data, status=201)
    return Response(s.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tutor_quizzes(request):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    return Response(QuizSerializer(Quiz.objects.filter(tutor=request.user).prefetch_related('questions'), many=True).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_quiz(request, quiz_id):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try:
        quiz = Quiz.objects.get(id=quiz_id, tutor=request.user)
        s = QuizCreateSerializer(quiz, data=request.data, context={'request': request})
        if s.is_valid(): return Response(QuizSerializer(s.save()).data)
        return Response(s.errors, status=400)
    except Quiz.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_quiz(request, quiz_id):
    if not _tutor(request.user): return Response({'error': 'Only tutors'}, status=403)
    try:
        Quiz.objects.get(id=quiz_id, tutor=request.user).delete()
        return Response({'message': 'Deleted'})
    except Quiz.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_learner_quizzes(request):
    return Response(QuizSerializer(Quiz.objects.all().prefetch_related('questions'), many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_result(request, quiz_id):
    if request.user.role != 'learner': return Response({'error': 'Only learners'}, status=403)
    try: quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist: return Response({'error': 'Not found'}, status=404)
    pct = request.data.get('score_percent')
    if pct is None: return Response({'error': 'score_percent required'}, status=400)
    try: pct = float(pct)
    except (TypeError, ValueError): return Response({'error': 'Invalid score'}, status=400)
    xp = 300 if pct >= 100 else (150 if pct >= 50 else 0)
    if xp > 0:
        try: request.user.add_xp(xp)
        except AttributeError: pass
    return Response({'message': 'Submitted', 'xp_awarded': xp, 'total_xp': getattr(request.user, 'experience', 0)})