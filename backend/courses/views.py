from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Course, Quiz, CourseEnrollment, CourseComment, CourseRating
from .serializers import (
    CourseSerializer, CourseCreateSerializer, CourseDetailSerializer,
    CourseCommentSerializer, CourseRatingSerializer,
    QuizSerializer, QuizCreateSerializer
)


def check_tutor_role(user):
    """Helper function to check if user is a tutor"""
    return user.role == 'tutor'


# ============ COURSE VIEWS (الكورس = الفيديو) ============

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_course(request):
    """إنشاء كورس = رفع الفيديو (Tutor only)"""
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can create courses'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = CourseCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        course = serializer.save()
        out = CourseSerializer(course, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tutor_courses(request):
    """قائمة كورسات الـ Tutor (كورساتي)"""
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )

    courses = Course.objects.filter(tutor=request.user)
    serializer = CourseSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    """حذف كورس (Tutor only, own courses)"""
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can delete courses'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        course = Course.objects.get(id=course_id, tutor=request.user)
        course.delete()
        return Response({'message': 'Course deleted successfully'}, status=status.HTTP_200_OK)
    except Course.DoesNotExist:
        return Response(
            {'error': 'Course not found or you do not have permission'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_learner_courses(request):
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_detail(request, course_id):
    """تفاصيل الكورس مع التعليقات والتقييم (للطالب أو التيوتور)"""
    try:
        course = Course.objects.prefetch_related('comments', 'ratings').get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = CourseDetailSerializer(course, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, course_id):
    """تسجيل الطالب في كورس (يظهر في In Progress)"""
    if request.user.role != 'learner':
        return Response({'error': 'Only learners can enroll'}, status=status.HTTP_403_FORBIDDEN)
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    enrollment, created = CourseEnrollment.objects.get_or_create(
        user=request.user, course=course,
        defaults={'progress': 0, 'completed': False}
    )
    return Response({
        'message': 'Enrolled successfully' if created else 'Already enrolled',
        'enrollment': {'course_id': course.id, 'progress': enrollment.progress}
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course_comment(request, course_id):
    """الطالب يضيف كومنت تحت الكورس (يظهر للتيوتور)"""
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    text = request.data.get('text', '').strip()
    if not text:
        return Response({'error': 'Comment text is required'}, status=status.HTTP_400_BAD_REQUEST)
    comment = CourseComment.objects.create(course=course, user=request.user, text=text)
    return Response(CourseCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_course_rating(request, course_id):
    """الطالب يقيّم الكورس من 1-5 نجمات"""
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    stars = request.data.get('stars')
    if stars is None:
        return Response({'error': 'stars (1-5) is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        stars = int(stars)
        if not 1 <= stars <= 5:
            raise ValueError('stars must be 1-5')
    except (TypeError, ValueError):
        return Response({'error': 'stars must be a number between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
    rating, _ = CourseRating.objects.update_or_create(
        course=course, user=request.user, defaults={'stars': stars}
    )
    return Response({'message': 'Rating saved', 'stars': rating.stars}, status=status.HTTP_200_OK)


# ============ QUIZ VIEWS ============

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request):
    """Create a quiz (Tutor only)"""
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can create quizzes'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = QuizCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        quiz = serializer.save()
        # Return full quiz with questions
        full_serializer = QuizSerializer(quiz)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_tutor_quizzes(request):
    """List all quizzes created by the current tutor"""
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )

    quizzes = Quiz.objects.filter(tutor=request.user).prefetch_related('questions')
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_quiz(request, quiz_id):
    """Update a quiz (Tutor only, own quizzes)"""
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can update quizzes'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        quiz = Quiz.objects.get(id=quiz_id, tutor=request.user)
        serializer = QuizCreateSerializer(quiz, data=request.data, context={'request': request})
        if serializer.is_valid():
            updated_quiz = serializer.save()
            # Return full quiz with questions
            full_serializer = QuizSerializer(updated_quiz)
            return Response(full_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found or you do not have permission'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_quiz(request, quiz_id):
    """Delete a quiz (Tutor only, own quizzes)"""
    if not check_tutor_role(request.user):
        return Response(
            {'error': 'Only tutors can delete quizzes'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        quiz = Quiz.objects.get(id=quiz_id, tutor=request.user)
        quiz.delete()
        return Response({'message': 'Quiz deleted successfully'}, status=status.HTTP_200_OK)
    except Quiz.DoesNotExist:
        return Response(
            {'error': 'Quiz not found or you do not have permission'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_learner_quizzes(request):
    """List all quizzes available for learners"""
    quizzes = Quiz.objects.all().prefetch_related('questions')
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)
