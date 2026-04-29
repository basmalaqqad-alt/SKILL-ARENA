# backend/courses/models.py
# ─────────────────────────────────────────────────────────────────────
# SAFE EXTENSION — يضيف CourseSection و CourseVideo
# ما يلمس أي field موجود (Course, CourseEnrollment, Quiz, إلخ)
# ─────────────────────────────────────────────────────────────────────

from django.db import models
from django.conf import settings


class Course(models.Model):
    tutor       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                    related_name='courses', limit_choices_to={'role': 'tutor'})
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file  = models.FileField(upload_to='courses/')          # الفيديو الأساسي (legacy)
    is_paid     = models.BooleanField(default=False)
    price       = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    difficulty  = models.CharField(max_length=20, default='beginner',
                                   choices=[('beginner','Beginner'),('intermediate','Intermediate'),('advanced','Advanced')])
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.tutor.username}"

    @property
    def display_price(self):
        if self.is_paid and self.price:
            return f"SAR {self.price}"
        return "Free"

    @property
    def total_video_count(self):
        """Main video + all section videos"""
        section_videos = sum(s.videos.count() for s in self.sections.all())
        extra = self.extra_videos.count()
        return 1 + extra + section_videos   # 1 = main video_file


# ── NEW: CourseSection ────────────────────────────────────────────
class CourseSection(models.Model):
    """Chapter / section inside a course."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title  = models.CharField(max_length=200)
    order  = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.course.title} › {self.title}"


# ── NEW: CourseVideo (section-aware) ─────────────────────────────
class CourseVideo(models.Model):
    """
    A video inside a section.
    Also used for legacy "extra videos" (section=None).
    """
    course   = models.ForeignKey(Course,        on_delete=models.CASCADE, related_name='extra_videos')
    section  = models.ForeignKey(CourseSection, on_delete=models.SET_NULL, null=True, blank=True, related_name='videos')
    title    = models.CharField(max_length=200, blank=True)
    video_file = models.FileField(upload_to='courses/videos/')
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)   # optional
    order    = models.PositiveIntegerField(default=0)
    has_quiz = models.BooleanField(default=False)   # hint for learner UI
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.course.title} — {self.title or 'Video'}"

    @property
    def video_url(self):
        if self.video_file:
            return self.video_file.url
        return None


# ── Existing models (unchanged) ───────────────────────────────────

class CourseEnrollment(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course     = models.ForeignKey(Course,  on_delete=models.CASCADE, related_name='enrollments')
    progress   = models.PositiveSmallIntegerField(default=0)
    completed  = models.BooleanField(default=False)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'course']
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.user.username} — {self.course.title} ({self.progress}%)"


class CourseComment(models.Model):
    course     = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='comments')
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_comments')
    text       = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class CourseRating(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ratings')
    user   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_ratings')
    stars  = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ['course', 'user']


class Quiz(models.Model):
    tutor   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='quizzes', limit_choices_to={'role': 'tutor'})
    course  = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes', null=True, blank=True)
    video   = models.ForeignKey(CourseVideo, on_delete=models.SET_NULL, null=True, blank=True,
                                related_name='quizzes')   # NEW: link quiz to specific video
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.tutor.username}"


class Question(models.Model):
    quiz           = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text  = models.TextField()
    option1        = models.CharField(max_length=200)
    option2        = models.CharField(max_length=200)
    option3        = models.CharField(max_length=200)
    option4        = models.CharField(max_length=200)
    correct_answer = models.IntegerField(choices=[(1,'Option 1'),(2,'Option 2'),(3,'Option 3'),(4,'Option 4')])

    class Meta:
        ordering = ['id']


class CoursePayment(models.Model):
    METHODS  = [('apple_pay','Apple Pay'),('card','Card'),('bank_transfer','Bank Transfer')]
    STATUSES = [('pending','Pending'),('completed','Completed'),('failed','Failed')]

    user    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_payments')
    course  = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='payments')
    tutor   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='received_payments', limit_choices_to={'role': 'tutor'})
    method  = models.CharField(max_length=20, choices=METHODS)
    amount  = models.DecimalField(max_digits=10, decimal_places=2)
    status  = models.CharField(max_length=20, choices=STATUSES, default='pending')
    card_last4            = models.CharField(max_length=4, blank=True)
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    paid_at      = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-paid_at']
        unique_together = ['user', 'course']


class CourseMaterial(models.Model):
    TYPES = [('pdf','PDF'),('doc','Word Document'),('other','Other')]
    course        = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    section       = models.ForeignKey(CourseSection, on_delete=models.SET_NULL,   # NEW optional link
                                      null=True, blank=True, related_name='materials')
    title         = models.CharField(max_length=200)
    file          = models.FileField(upload_to='courses/materials/')
    material_type = models.CharField(max_length=10, choices=TYPES, default='other')
    created_at    = models.DateTimeField(auto_now_add=True)
    order         = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'created_at']