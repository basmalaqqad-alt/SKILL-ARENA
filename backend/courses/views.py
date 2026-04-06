from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Course, Quiz, CourseEnrollment, CourseComment, CourseRating, CoursePayment
from django.utils import timezone
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

        # P2P Contribution: +500 XP لكل كورس يرفعه التيوتور
        try:
            request.user.add_xp(500)
        except AttributeError:
            # في حال لم يتم تحديث موديل المستخدم لأي سبب، نتجاهل XP ولا نكسر الـ API
            pass

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
    """قائمة جميع الكورسات المتاحة للطالب"""
    courses = Course.objects.all()
    serializer = CourseSerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_learner_enrolled_courses(request):
    """قائمة الكورسات المسجلة فيها الطالب (My Courses)"""
    if request.user.role != 'learner':
        return Response({'error': 'Only learners can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    
    enrollments = CourseEnrollment.objects.filter(user=request.user).select_related('course', 'course__tutor').prefetch_related('course__quizzes__questions')
    courses_data = []
    for enrollment in enrollments:
        course = enrollment.course
        serializer = CourseDetailSerializer(course, context={'request': request})
        course_dict = serializer.data
        course_dict['enrollment'] = {
            'progress': enrollment.progress,
            'completed': enrollment.completed,
            'enrolled_at': enrollment.enrolled_at,
        }
        courses_data.append(course_dict)
    
    return Response(courses_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_detail(request, course_id):
    """تفاصيل الكورس مع التعليقات والتقييم والكويزات (للطالب أو التيوتور)"""
    try:
        course = Course.objects.prefetch_related('comments', 'ratings', 'quizzes__questions').get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = CourseDetailSerializer(course, context={'request': request})
    data = serializer.data
    
    # إضافة معلومات البنك للإنستركتور إذا كان الكورس مدفوع
    if course.is_paid and course.price:
        try:
            from accounts.models import BankAccount
            bank_account = BankAccount.objects.get(tutor=course.tutor)
            data['tutor_bank_account'] = {
                'bank_name': bank_account.bank_name,
                'account_holder_name': bank_account.account_holder_name,
                'account_number': '*' * (len(bank_account.account_number) - 4) + bank_account.account_number[-4:] if len(bank_account.account_number) > 4 else bank_account.account_number,
                'iban': bank_account.iban,
                'swift_code': bank_account.swift_code,
                'branch_name': bank_account.branch_name,
            }
        except BankAccount.DoesNotExist:
            data['tutor_bank_account'] = None
    
    return Response(data)


def _validate_card(card_number, expiry_month, expiry_year, cvv):
    """تحقق من صيغة البطاقة (للديمو فقط - لا نتحقق من الدفع الفعلي)."""
    import re
    if not card_number or len(re.sub(r'\s', '', str(card_number))) < 13:
        return False, 'رقم البطاقة غير صالح'
    try:
        m, y = int(expiry_month), int(expiry_year)
        if not (1 <= m <= 12):
            return False, 'شهر انتهاء الصلاحية غير صالح'
        if y < 100:
            y += 2000
        if y < 2020 or y > 2050:
            return False, 'سنة انتهاء الصلاحية غير صالحة'
    except (TypeError, ValueError):
        return False, 'تاريخ انتهاء الصلاحية غير صالح'
    if not cvv or len(str(cvv).strip()) < 3:
        return False, 'CVV مطلوب (3 أو 4 أرقام)'
    return True, None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request, course_id):
    """تسجيل الطالب في كورس. إذا الكورس مدفوع يُرسل payment_method وبيانات الدفع إن لزم."""
    if request.user.role != 'learner':
        return Response({'error': 'Only learners can enroll'}, status=status.HTTP_403_FORBIDDEN)
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

    is_paid = course.is_paid and (course.price or 0) > 0
    amount = course.price or 0

    if is_paid:
        payment_method = (request.data.get('payment_method') or '').strip().lower()
        if payment_method not in ('apple_pay', 'card', 'bank_transfer'):
            return Response(
                {'error': 'payment_required', 'message': 'الكورس مدفوع. أرسل payment_method: apple_pay أو card أو bank_transfer مع بيانات الدفع.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        card_last4 = ''
        transaction_ref = request.data.get('transaction_reference', '')
        
        if payment_method == 'card':
            card_number = request.data.get('card_number') or ''
            card_holder_name = request.data.get('card_holder_name') or ''
            expiry_month = request.data.get('expiry_month')
            expiry_year = request.data.get('expiry_year')
            cvv = request.data.get('cvv')
            if not card_holder_name.strip():
                return Response({'error': 'card_holder_name مطلوب للدفع بالبطاقة'}, status=status.HTTP_400_BAD_REQUEST)
            ok, err = _validate_card(card_number, expiry_month, expiry_year, cvv)
            if not ok:
                return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)
            card_digits = ''.join(c for c in str(card_number) if c.isdigit())
            card_last4 = card_digits[-4:] if len(card_digits) >= 4 else card_digits

        # إنشاء سجل الدفع ثم التسجيل
        payment, _ = CoursePayment.objects.update_or_create(
            user=request.user, course=course,
            defaults={
                'tutor': course.tutor,
                'method': payment_method,
                'amount': amount,
                'card_last4': card_last4,
                'transaction_reference': transaction_ref,
                'status': 'completed' if payment_method in ('apple_pay', 'card') else 'pending',
                'completed_at': timezone.now() if payment_method in ('apple_pay', 'card') else None,
            }
        )

    enrollment, created = CourseEnrollment.objects.get_or_create(
        user=request.user, course=course,
        defaults={'progress': 0, 'completed': False}
    )
    return Response({
        'message': 'Enrolled successfully' if created else 'Already enrolled',
        'enrollment': {'course_id': course.id, 'progress': enrollment.progress},
        'payment': {
            'method': payment.method if is_paid else None,
            'amount': float(payment.amount) if is_paid else None,
            'status': payment.status if is_paid else None,
        } if is_paid else None,
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
    # P2P Contribution: +50 XP لكل تعليق (إجابة) من الطالب
    try:
        request.user.add_xp(50)
    except AttributeError:
        pass
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_course(request, course_id):
    """إكمال الكورس - يعطي +50 XP عند إكمال الكورس لأول مرة"""
    if request.user.role != 'learner':
        return Response({'error': 'Only learners can complete courses'}, status=status.HTTP_403_FORBIDDEN)
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        enrollment = CourseEnrollment.objects.get(user=request.user, course=course)
    except CourseEnrollment.DoesNotExist:
        return Response({'error': 'You must enroll in this course first'}, status=status.HTTP_400_BAD_REQUEST)
    
    # إذا كان مكتمل مسبقاً، لا نعطي XP مرة ثانية
    was_completed = enrollment.completed
    enrollment.completed = True
    enrollment.progress = 100
    enrollment.save()
    
    xp_awarded = 0
    if not was_completed:
        # Course Completion: +50 XP لأول مرة فقط
        try:
            request.user.add_xp(50)
            xp_awarded = 50
        except AttributeError:
            pass
    
    return Response({
        'message': 'Course completed successfully',
        'xp_awarded': xp_awarded,
        'total_xp': request.user.experience,
        'enrollment': {'course_id': course.id, 'progress': enrollment.progress, 'completed': enrollment.completed}
    }, status=status.HTTP_200_OK)


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz_result(request, quiz_id):
    """
    تسليم نتيجة الكويز - يحسب XP حسب النسبة:
    - 100% (perfect score) = 300 XP
    - 50%+ = 150 XP
    - أقل من 50% = 0 XP
    """
    if request.user.role != 'learner':
        return Response({'error': 'Only learners can submit quiz results'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        quiz = Quiz.objects.prefetch_related('questions').get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)
    
    score_percent = request.data.get('score_percent')
    if score_percent is None:
        return Response({'error': 'score_percent is required (0-100)'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        score_percent = float(score_percent)
        if not 0 <= score_percent <= 100:
            raise ValueError('score_percent must be between 0 and 100')
    except (TypeError, ValueError) as e:
        return Response({'error': 'score_percent must be a number between 0 and 100'}, status=status.HTTP_400_BAD_REQUEST)
    
    # حساب XP حسب النسبة
    if score_percent >= 100:
        xp_awarded = 300  # Perfect score
    elif score_percent >= 50:
        xp_awarded = 150  # 50%+
    else:
        xp_awarded = 0  # أقل من 50%
    
    # إضافة XP للمستخدم
    if xp_awarded > 0:
        try:
            request.user.add_xp(xp_awarded)
        except AttributeError:
            pass
    
    return Response({
        'message': 'Quiz result submitted successfully',
        'score_percent': score_percent,
        'xp_awarded': xp_awarded,
        'total_xp': request.user.experience,
    }, status=status.HTTP_200_OK)
