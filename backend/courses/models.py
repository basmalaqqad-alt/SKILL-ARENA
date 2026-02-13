from django.db import models
from django.conf import settings


class Course(models.Model):
    """
    الكورس = الفيديو. رفع الفيديو = نشر الكورس.
    التيوتور يقدر يحدد إذا الكورس بفلوس وكم السعر.
    """
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses',
        limit_choices_to={'role': 'tutor'}
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='courses/')
    is_paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.tutor.username}"


class CourseEnrollment(models.Model):
    """تسجيل المتعلم في كورس + نسبة الإكمال"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    progress = models.PositiveSmallIntegerField(default=0)  # 0-100
    completed = models.BooleanField(default=False)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course']
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.progress}%)"


class CourseComment(models.Model):
    """كومنتات الطلاب تحت الكورس، تظهر للتيوتور"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} on {self.course.title}"


class CourseRating(models.Model):
    """تقييم الطالب للكورس من 1-5 نجمات"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_ratings')
    stars = models.PositiveSmallIntegerField()  # 1-5

    class Meta:
        unique_together = ['course', 'user']

    def __str__(self):
        return f"{self.user.username} -> {self.course.title}: {self.stars} stars"


class Quiz(models.Model):
    """Model for tutor-created quizzes"""
    tutor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quizzes',
        limit_choices_to={'role': 'tutor'}
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.tutor.username}"


class Question(models.Model):
    """Model for quiz questions"""
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    question_text = models.TextField()
    option1 = models.CharField(max_length=200)
    option2 = models.CharField(max_length=200)
    option3 = models.CharField(max_length=200)
    option4 = models.CharField(max_length=200)
    correct_answer = models.IntegerField(
        choices=[(1, 'Option 1'), (2, 'Option 2'), (3, 'Option 3'), (4, 'Option 4')]
    )

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"Q: {self.question_text[:50]}... (Quiz: {self.quiz.title})"
