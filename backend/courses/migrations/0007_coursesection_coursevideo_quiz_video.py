# backend/courses/migrations/0007_coursesection_coursevideo_quiz_video.py

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_coursematerial'),   # ✅ آخر migration موجود عندك
    ]

    operations = [

        # ── 1. difficulty field on Course ─────────────────────
        migrations.AddField(
            model_name='course',
            name='difficulty',
            field=models.CharField(
                max_length=20,
                default='beginner',
                choices=[
                    ('beginner',     'Beginner'),
                    ('intermediate', 'Intermediate'),
                    ('advanced',     'Advanced'),
                ],
            ),
        ),

        # ── 2. CourseSection ──────────────────────────────────
        migrations.CreateModel(
            name='CourseSection',
            fields=[
                ('id',    models.BigAutoField(auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('order', models.PositiveIntegerField(default=0)),
                ('course', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='sections',
                    to='courses.course',
                )),
            ],
            options={'ordering': ['order', 'id']},
        ),

        # ── 3. CourseVideo ────────────────────────────────────
        migrations.CreateModel(
            name='CourseVideo',
            fields=[
                ('id',               models.BigAutoField(auto_created=True, primary_key=True)),
                ('title',            models.CharField(max_length=200, blank=True)),
                ('video_file',       models.FileField(upload_to='courses/videos/')),
                ('duration_seconds', models.PositiveIntegerField(null=True, blank=True)),
                ('order',            models.PositiveIntegerField(default=0)),
                ('has_quiz',         models.BooleanField(default=False)),
                ('created_at',       models.DateTimeField(auto_now_add=True)),
                ('course', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='extra_videos',
                    to='courses.course',
                )),
                ('section', models.ForeignKey(
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='videos',
                    to='courses.coursesection',
                    null=True, blank=True,
                )),
            ],
            options={'ordering': ['order', 'id']},
        ),

        # ── 4. section FK → CourseMaterial ───────────────────
        migrations.AddField(
            model_name='coursematerial',
            name='section',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='materials',
                to='courses.coursesection',
                null=True, blank=True,
            ),
        ),

        # ── 5. video FK → Quiz ────────────────────────────────
        migrations.AddField(
            model_name='quiz',
            name='video',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='quizzes',
                to='courses.coursevideo',
                null=True, blank=True,
            ),
        ),
    ]