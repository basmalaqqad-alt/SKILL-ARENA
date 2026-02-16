from rest_framework import serializers
from .models import Course, Quiz, Question, CourseEnrollment, CourseComment, CourseRating


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_answer']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    tutor_username = serializers.CharField(source='tutor.username', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True, allow_null=True)
    course_title = serializers.CharField(source='course.title', read_only=True, allow_null=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'tutor_username', 'course_id', 'course_title', 'questions', 'created_at', 'updated_at']
        read_only_fields = ['tutor', 'created_at', 'updated_at']


class QuizCreateSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ['title', 'description', 'course', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        course = validated_data.pop('course', None)
        tutor = self.context['request'].user
        quiz = Quiz.objects.create(tutor=tutor, course=course, **validated_data)
        
        for question_data in questions_data:
            Question.objects.create(quiz=quiz, **question_data)
        
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        if questions_data is not None:
            # Delete existing questions
            instance.questions.all().delete()
            # Create new questions
            for question_data in questions_data:
                Question.objects.create(quiz=instance, **question_data)

        return instance


class CourseSerializer(serializers.ModelSerializer):
    tutor_username = serializers.CharField(source='tutor.username', read_only=True)
    video_url = serializers.SerializerMethodField()
    tutor_verified = serializers.SerializerMethodField()
    display_price = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'tutor_username', 'tutor_verified',
            'video_url', 'is_paid', 'price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['tutor', 'created_at', 'updated_at']

    def get_video_url(self, obj):
        if obj.video_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
        return None

    def get_tutor_verified(self, obj):
        return getattr(obj.tutor, 'is_trusted_tutor', bool(obj.tutor.certificate))

    def get_display_price(self, obj):
        if obj.is_paid and obj.price:
            return f"SAR {obj.price}"
        return 'Free'


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['title', 'description', 'video_file', 'is_paid', 'price']

    def create(self, validated_data):
        tutor = self.context['request'].user
        return Course.objects.create(tutor=tutor, **validated_data)


class CourseCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CourseComment
        fields = ['id', 'username', 'text', 'created_at']
        read_only_fields = ['user', 'course']


class CourseRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRating
        fields = ['stars']


class CourseDetailSerializer(serializers.ModelSerializer):
    tutor_username = serializers.CharField(source='tutor.username', read_only=True)
    tutor_verified = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    display_price = serializers.SerializerMethodField()
    comments = CourseCommentSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'tutor_username', 'tutor_verified',
            'video_url', 'is_paid', 'price', 'display_price', 'comments', 'quizzes', 'average_rating', 'rating_count',
            'created_at', 'updated_at'
        ]

    def get_tutor_verified(self, obj):
        return getattr(obj.tutor, 'is_trusted_tutor', bool(obj.tutor.certificate))

    def get_video_url(self, obj):
        if obj.video_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
        return None

    def get_average_rating(self, obj):
        from django.db.models import Avg
        r = obj.ratings.aggregate(avg=Avg('stars'))
        return round(r['avg'], 1) if r['avg'] is not None else None

    def get_rating_count(self, obj):
        return obj.ratings.count()

    def get_display_price(self, obj):
        if obj.is_paid and obj.price:
            return f"SAR {obj.price}"
        return 'Free'
