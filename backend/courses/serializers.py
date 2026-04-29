# backend/courses/serializers.py

from rest_framework import serializers
from django.db.models import Avg, Count
from .models import (
    Course, CourseSection, CourseVideo, CourseEnrollment,
    CourseComment, CourseRating, Quiz, Question, CoursePayment, CourseMaterial,
)


# ── Question ─────────────────────────────────────────────────────
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Question
        fields = ['id', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_answer']


# ── Quiz (read) ───────────────────────────────────────────────────
class QuizSerializer(serializers.ModelSerializer):
    questions    = QuestionSerializer(many=True, read_only=True)
    course_title = serializers.SerializerMethodField()

    class Meta:
        model  = Quiz
        fields = ['id', 'title', 'description', 'course', 'course_title', 'video', 'questions', 'created_at']

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None


# ── Quiz (create/update) ──────────────────────────────────────────
class QuizCreateSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model  = Quiz
        fields = ['id', 'title', 'description', 'course', 'video', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        quiz = Quiz.objects.create(tutor=self.context['request'].user, **validated_data)
        for q in questions_data:
            Question.objects.create(quiz=quiz, **q)
        # mark video as having a quiz
        if quiz.video:
            quiz.video.has_quiz = True
            quiz.video.save(update_fields=['has_quiz'])
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', [])
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        instance.questions.all().delete()
        for q in questions_data:
            Question.objects.create(quiz=instance, **q)
        if instance.video:
            instance.video.has_quiz = True
            instance.video.save(update_fields=['has_quiz'])
        return instance


# ── CourseMaterial ────────────────────────────────────────────────
class CourseMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model  = CourseMaterial
        fields = ['id', 'title', 'material_type', 'file_url', 'order', 'section']

    def get_file_url(self, obj):
        req = self.context.get('request')
        if obj.file and req:
            return req.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


# ── CourseVideo ───────────────────────────────────────────────────
class CourseVideoSerializer(serializers.ModelSerializer):
    video_url        = serializers.SerializerMethodField()
    quiz_count       = serializers.SerializerMethodField()

    class Meta:
        model  = CourseVideo
        fields = ['id', 'title', 'video_url', 'duration_seconds', 'order', 'has_quiz', 'quiz_count', 'section']

    def get_video_url(self, obj):
        req = self.context.get('request')
        if obj.video_file and req:
            return req.build_absolute_uri(obj.video_file.url)
        return None

    def get_quiz_count(self, obj):
        return obj.quizzes.count()


# ── CourseSection ─────────────────────────────────────────────────
class CourseSectionSerializer(serializers.ModelSerializer):
    videos    = CourseVideoSerializer(many=True, read_only=True)
    materials = CourseMaterialSerializer(many=True, read_only=True)

    class Meta:
        model  = CourseSection
        fields = ['id', 'title', 'order', 'videos', 'materials']


# ── Course list (lightweight) ─────────────────────────────────────
class CourseSerializer(serializers.ModelSerializer):
    tutor_username   = serializers.CharField(source='tutor.username', read_only=True)
    tutor_verified   = serializers.BooleanField(source='tutor.is_trusted_tutor', read_only=True)
    display_price    = serializers.ReadOnlyField()
    average_rating   = serializers.SerializerMethodField()
    rating_count     = serializers.IntegerField(source='ratings.count', read_only=True)
    enrolled         = serializers.SerializerMethodField()
    video_count      = serializers.SerializerMethodField()
    extra_videos     = CourseVideoSerializer(many=True, read_only=True)
    materials        = CourseMaterialSerializer(many=True, read_only=True)

    class Meta:
        model  = Course
        fields = [
            'id', 'title', 'description', 'difficulty',
            'is_paid', 'price', 'display_price',
            'tutor_username', 'tutor_verified',
            'average_rating', 'rating_count',
            'enrolled', 'video_count',
            'extra_videos', 'materials',
            'created_at',
        ]

    def get_average_rating(self, obj):
        agg = obj.ratings.aggregate(avg=Avg('stars'))
        val = agg['avg']
        return round(val, 1) if val else 0

    def get_enrolled(self, obj):
        req = self.context.get('request')
        if req and req.user.is_authenticated:
            return obj.enrollments.filter(user=req.user).exists()
        return False

    def get_video_count(self, obj):
        return obj.total_video_count


# ── Course detail (full) ──────────────────────────────────────────
class CourseDetailSerializer(CourseSerializer):
    sections             = CourseSectionSerializer(many=True, read_only=True)
    comments             = serializers.SerializerMethodField()
    quizzes              = QuizSerializer(many=True, read_only=True)
    user_rating          = serializers.SerializerMethodField()
    rating_distribution  = serializers.SerializerMethodField()
    video_url            = serializers.SerializerMethodField()
    tutor_credential     = serializers.SerializerMethodField()   # NEW

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + [
            'sections', 'comments', 'quizzes',
            'user_rating', 'rating_distribution',
            'video_url', 'tutor_credential',
        ]

    def get_video_url(self, obj):
        req = self.context.get('request')
        if obj.video_file and req:
            return req.build_absolute_uri(obj.video_file.url)
        return None

    def get_comments(self, obj):
        comments = obj.comments.select_related('user').order_by('-created_at')[:50]
        return [{'id': c.id, 'username': c.user.username, 'text': c.text, 'created_at': c.created_at} for c in comments]

    def get_user_rating(self, obj):
        req = self.context.get('request')
        if req and req.user.is_authenticated:
            r = obj.ratings.filter(user=req.user).first()
            return r.stars if r else 0
        return 0

    def get_rating_distribution(self, obj):
        dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in obj.ratings.values('stars').annotate(c=Count('stars')):
            dist[r['stars']] = r['c']
        return dist

    def get_tutor_credential(self, obj):
        """Return tutor's verified credential info (from VerificationRequest)."""
        try:
            from django.apps import apps
            VR = apps.get_model('accounts', 'VerificationRequest')
            vr = VR.objects.get(tutor=obj.tutor, status='approved')
            return {
                'credential_type': vr.get_credential_type_display(),
                'institution':     vr.institution,
                'graduation_year': vr.graduation_year,
                'field_of_study':  vr.field_of_study,
            }
        except Exception:
            return None


# ── Course create ─────────────────────────────────────────────────
class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Course
        fields = ['title', 'description', 'video_file', 'is_paid', 'price', 'difficulty']

    def create(self, validated_data):
        return Course.objects.create(tutor=self.context['request'].user, **validated_data)


# ── Comment / Rating (create) ─────────────────────────────────────
class CourseCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model  = CourseComment
        fields = ['id', 'username', 'text', 'created_at']


class CourseRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CourseRating
        fields = ['id', 'course', 'stars']