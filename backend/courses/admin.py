from django.contrib import admin
from .models import Course, Quiz, Question, CourseEnrollment, CourseComment, CourseRating


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'tutor', 'created_at']
    list_filter = ['created_at', 'tutor']
    search_fields = ['title', 'tutor__username']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'tutor', 'created_at']
    list_filter = ['created_at', 'tutor']
    search_fields = ['title', 'tutor__username']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'quiz', 'correct_answer']
    list_filter = ['quiz']
    search_fields = ['question_text', 'quiz__title']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'progress', 'completed', 'enrolled_at']


@admin.register(CourseComment)
class CourseCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'created_at']


@admin.register(CourseRating)
class CourseRatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'stars']
